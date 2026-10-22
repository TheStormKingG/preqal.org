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

/* How long a post may sit with the reviewer before the weekly run stops
   treating silence as normal. One cycle unanswered is a reminder; two is the
   pipeline being held shut by a draft nobody is going to answer. */
export const STALE_AFTER_DAYS = 7;
export const RELEASE_AFTER_DAYS = 14;

/**
 * What should THIS Monday's run do?
 *
 * The rule used to be a line of prose in the task file: if `awaiting` is set,
 * stop. That is correct for a week and wrong forever. On 2026-10-20 the run
 * fired, found a draft from the day before still unanswered, stopped, and
 * reported success in five and a half minutes. Nothing was broken and nothing
 * was produced, and the two readings are indistinguishable from outside: a run
 * that writes a post takes about half an hour, and both say "succeeded".
 *
 * So the decision moves here, where it can be tested, and it returns an
 * outcome the run has to print rather than a boolean it can describe however
 * it likes.
 *
 * @param {object} state  from readState()
 * @param {Date}   now    injected, never read from the clock here
 */
export function decideWeeklyRun(state, now) {
  const halt = (outcome, reason) => ({ action: 'halt', outcome, reason, ageDays: null });

  /* A corrupt state file might be hiding a post already sent out. Producing
     another one would put two in front of the reviewer, which is the thing the
     original rule existed to prevent, so this stops — but loudly, and as its
     own outcome rather than as a skip. */
  if (state.corrupt) {
    return halt('BLOCKED', 'review-state.json is unreadable — repair it before the next run');
  }

  if (!state.awaiting) {
    return { action: 'produce', outcome: 'PRODUCE', ageDays: null, reason: 'nothing awaiting review' };
  }

  const { slug, sentAt } = state.awaiting;
  const sent = new Date(sentAt);
  if (Number.isNaN(sent.getTime())) {
    /* An unreadable timestamp cannot be aged, so it cannot be shown to have
       been waiting a short time. Escalate rather than skip quietly. */
    return {
      action: 'escalate',
      outcome: 'ESCALATE',
      ageDays: null,
      reason: `${slug} is awaiting review but its sentAt (${sentAt}) will not parse`,
    };
  }

  const ageDays = Math.round(((now.getTime() - sent.getTime()) / 86_400_000) * 10) / 10;

  if (ageDays < STALE_AFTER_DAYS) {
    return {
      action: 'skip',
      outcome: 'SKIP',
      ageDays,
      reason: `${slug} has been with the reviewer ${ageDays}d, under the ${STALE_AFTER_DAYS}d mark`,
    };
  }

  if (ageDays < RELEASE_AFTER_DAYS) {
    return {
      action: 'escalate',
      outcome: 'ESCALATE',
      ageDays,
      reason: `${slug} has been unanswered ${ageDays}d, past ${STALE_AFTER_DAYS}d — chase it on the existing thread, and still do not add a second post to that thread`,
    };
  }

  /* Past two cycles the hold costs more than the clash it was preventing. The
     new post goes out on its OWN thread, so the reviewer still never has two
     posts in one thread to untangle, and the old draft stays pending rather
     than being thrown away. */
  return {
    action: 'release',
    outcome: 'RELEASE',
    ageDays,
    reason: `${slug} has been unanswered ${ageDays}d, past ${RELEASE_AFTER_DAYS}d — produce this week's post on a NEW thread and leave the old one pending`,
  };
}

/** The one line a weekly run must print, so a skip can never read as a post. */
export function weeklyOutcomeLine(decision) {
  const age = decision.ageDays === null ? '' : ` after ${decision.ageDays}d`;
  return `OUTCOME: ${decision.outcome}${age} — ${decision.reason}`;
}
