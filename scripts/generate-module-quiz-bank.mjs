/**
 * Reads public/e-courses/modules/{id}/quiz.docx and writes
 * components/ecourses/moduleQuizBank.generated.ts
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const MODULES = [
  'ms-really',
  'quality-iso-simplified',
  'process-thinking',
  'risk-based-thinking',
  'documentation-works',
  'people-drive-quality',
  'monitoring-measurement',
  'audits-capa',
  'continual-improvement',
];

function decodeXml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractParagraphs(docxPath) {
  const xml = execSync(`unzip -p "${docxPath}" word/document.xml`, {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  });
  const paras = [];
  const parts = xml.split('<w:p ');
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const texts = [...chunk.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)]
      .map((m) => decodeXml(m[1]))
      .join('');
    const t = texts.trim();
    if (t) paras.push(t);
  }
  return paras;
}

function tryParseMcBlock(block) {
  const qm = block.match(
    /^(\d+)\.\s+(.+?)\s+A\)\s+(.+?)\s+B\)\s+(.+?)\s+C\)\s+(.+?)\s+D\)\s+(.+)$/,
  );
  if (!qm) return null;
  return {
    n: parseInt(qm[1], 10),
    stem: qm[2].trim(),
    A: qm[3].trim(),
    B: qm[4].trim(),
    C: qm[5].trim(),
    D: qm[6].trim(),
  };
}

/** Merge multi-paragraph questions (stem on one line, options on next). */
function parseQuestions(paras) {
  const questions = [];
  let i = 0;
  while (i < paras.length) {
    const t = paras[i].trim();
    if (/^answer key/i.test(t) || /^-+$/.test(t)) break;
    const head = t.match(/^(\d+)\.\s+/);
    if (!head) {
      i += 1;
      continue;
    }
    const curN = parseInt(head[1], 10);
    let block = t;
    let j = i + 1;
    while (j < paras.length) {
      const nt = paras[j].trim();
      if (/^answer key/i.test(nt) || /^-+$/.test(nt)) break;
      const nextHead = nt.match(/^(\d+)\.\s+/);
      if (nextHead && parseInt(nextHead[1], 10) !== curN) break;
      block += ' ' + nt;
      j += 1;
      if (tryParseMcBlock(block)?.n === curN) break;
    }
    const parsed = tryParseMcBlock(block);
    if (parsed) questions.push(parsed);
    i = j;
  }
  return questions;
}

/**
 * Parses the Answer Key section into per-question correct letter + explanation text from the .docx.
 * Supports: "N. Correct Answer: C ...", "N. B) explanation...", "N. C explanation..." (not "Correct...").
 */
function parseAnswerKey(paras) {
  let inKey = false;
  /** @type {Record<number, { correct: string; explanation: string }>} */
  const entries = {};
  for (const p of paras) {
    const trimmed = p.trim();
    if (/^answer key/i.test(trimmed) || /^-+$/.test(trimmed)) {
      inKey = true;
      continue;
    }
    if (!inKey) continue;
    if (!trimmed || trimmed === '.') continue;

    let m = trimmed.match(/^(\d+)\.\s*Correct Answer:\s*([A-D])\b\s*(.*)$/i);
    if (m) {
      entries[+m[1]] = { correct: m[2].toUpperCase(), explanation: (m[3] || '').trim() };
      continue;
    }
    if (/^\d+\.\s*Correct\b/i.test(trimmed)) continue;

    m = trimmed.match(/^(\d+)\.\s*([A-D])\)\s*(.*)$/);
    if (m) {
      entries[+m[1]] = { correct: m[2].toUpperCase(), explanation: (m[3] || '').trim() };
      continue;
    }
    m = trimmed.match(/^(\d+)\.\s*([A-D])\s+(.+)$/);
    if (m) {
      entries[+m[1]] = { correct: m[2].toUpperCase(), explanation: (m[3] || '').trim() };
    }
  }
  return entries;
}

function parseDocxParagraphs(paras) {
  return {
    questions: parseQuestions(paras),
    answerKey: parseAnswerKey(paras),
  };
}

function buildModuleQuiz(id) {
  const docx = path.join(root, 'public/e-courses/modules', id, 'quiz.docx');
  if (!fs.existsSync(docx)) {
    console.warn(`[generate-module-quiz-bank] Missing ${docx}`);
    return [];
  }
  const paras = extractParagraphs(docx);
  const { questions, answerKey } = parseDocxParagraphs(paras);
  const sorted = questions.sort((a, b) => a.n - b.n);
  const out = [];
  for (const q of sorted) {
    const row = answerKey[q.n];
    if (!row || !row.correct || !['A', 'B', 'C', 'D'].includes(row.correct)) {
      console.warn(`[generate-module-quiz-bank] ${id} Q${q.n}: missing answer, skip`);
      continue;
    }
    out.push({
      id: q.n,
      question: q.stem,
      choices: [
        { key: 'A', text: q.A },
        { key: 'B', text: q.B },
        { key: 'C', text: q.C },
        { key: 'D', text: q.D },
      ],
      correct: row.correct,
      explanation: row.explanation || '',
    });
  }
  return out;
}

const bank = {};
for (const id of MODULES) {
  bank[id] = buildModuleQuiz(id);
  console.log(`[generate-module-quiz-bank] ${id}: ${bank[id].length} questions`);
}

const outPath = path.join(root, 'components/ecourses/moduleQuizBank.generated.ts');
const body = `/* eslint-disable */
// Generated by scripts/generate-module-quiz-bank.mjs — do not edit by hand.

export type QuizChoiceKey = 'A' | 'B' | 'C' | 'D';

export type QuizQuestion = {
  id: number;
  question: string;
  choices: { key: QuizChoiceKey; text: string }[];
  correct: QuizChoiceKey;
  /** Rationale from the quiz document answer key (may be empty if not present). */
  explanation: string;
};

export const MODULE_QUIZ_BANK: Record<string, QuizQuestion[]> = ${JSON.stringify(bank, null, 2)};
`;

fs.writeFileSync(outPath, body);
console.log('[generate-module-quiz-bank] Wrote', outPath);
