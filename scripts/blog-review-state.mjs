/* The review state machine, and the decision of whether THIS tick should act.
   Cron cannot express "every 10 minutes for 48 hours, then once a day", so the
   schedule fires every ten minutes flat and the decay lives here. Keeping it
   in a script
   rather than in the task prompt is deliberate: a prompt cannot be unit
   tested, and this is the logic that decides whether a post gets published. */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const STATE = join(here, '..', 'content', 'blog', 'runs', 'review-state.json');

export const HOT_WINDOW_HOURS = 48;
export const DAILY_SLOT_HOUR = 9;      // local hour for the cold-phase check
export const MAX_REVISIONS = 5;

export function readState() {
  if (!existsSync(STATE)) return { awaiting: null };
  try {
    return JSON.parse(readFileSync(STATE, 'utf8'));
  } catch {
    /* A corrupt state file must not read as "nothing pending" — that would
       silently abandon a post already sent for review. */
    return { awaiting: null, corrupt: true };
  }
}

export function writeState(s) {
  mkdirSync(dirname(STATE), { recursive: true });
  writeFileSync(STATE, JSON.stringify(s, null, 2) + '\n', 'utf8');
}

/**
 * Should this tick check the mail thread?
 * @param {object} state   from readState()
 * @param {Date}   now     injected, never read from the clock here — a function
 *                         that reads the clock internally cannot be tested.
 */
export function shouldCheck(state, now) {
  if (state.corrupt) return { check: true, phase: 'corrupt-state', reason: 'state file unreadable — check and repair' };
  if (!state.awaiting) return { check: false, phase: 'idle', reason: 'no post awaiting review' };

  const sentAt = new Date(state.awaiting.sentAt);
  if (Number.isNaN(sentAt.getTime())) {
    return { check: true, phase: 'bad-timestamp', reason: 'sentAt unparseable — treat as hot' };
  }
  const ageHours = (now.getTime() - sentAt.getTime()) / 3_600_000;

  if (ageHours < HOT_WINDOW_HOURS) {
    return { check: true, phase: 'hot', ageHours: Math.round(ageHours * 10) / 10,
             reason: `within the ${HOT_WINDOW_HOURS}h window` };
  }
  /* Cold phase: one check a day. The 10-minute cron still fires, and all but
     one tick an hour returns false, so the daily check is at most 10 minutes
     late rather than skipped. */
  if (now.getHours() === DAILY_SLOT_HOUR && now.getMinutes() < 10) {
    return { check: true, phase: 'cold-daily', ageHours: Math.round(ageHours),
             reason: `past ${HOT_WINDOW_HOURS}h — daily slot` };
  }
  return { check: false, phase: 'cold-quiet', ageHours: Math.round(ageHours),
           reason: `past ${HOT_WINDOW_HOURS}h — next check at ${DAILY_SLOT_HOUR}:00` };
}

/** Classify a human reply. Ambiguity resolves to ASK, never to publish. */
export function classifyReply(text) {
  const t = (text || '').trim();
  if (!t) return { verdict: 'ambiguous', reason: 'empty reply' };
  const head = t.slice(0, 400).toLowerCase();
  const approve = /\b(approve|approved|publish it|ship it|looks good to publish|go ahead and post)\b/.test(head);
  /* Stems, not exact words. An earlier version matched "changes" but not
     "change", so "approve but change the title" classified as APPROVE — a
     reply carrying an edit request read as consent to publish, which is the
     worst outcome this function can produce. Err toward ambiguous. */
  const reject = /\b(reject|rejected|chang(?:e|es|ed)|revis(?:e|ed|ion|ions)|rewrit(?:e|ing)|edit(?:s|ed|ing)?|amend(?:ed)?|tweak(?:s|ed)?|shorten|tighten|cut|drop|remove|replace|fix(?:es|ed)?|instead|rather than)\b/.test(head);

  if (approve && reject) return { verdict: 'ambiguous', reason: 'reply contains both an approval and a change request' };
  if (approve) return { verdict: 'approve' };
  if (reject) return { verdict: 'reject', instructions: t };
  /* A reply that is neither is still information — it is usually an edit
     written without the keyword. Treat it as a change request rather than
     silence, but never as consent. */
  return { verdict: 'ambiguous', reason: 'no APPROVE or REJECT keyword found' };
}
