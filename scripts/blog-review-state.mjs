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

/* `awaiting` held ONE post until 2026-11-10, when two drafts were out for
   review at once and only one could be watched — a reply on the other thread
   would have been seen by nothing. The weekly run's own `release` state had
   described that situation from the start ("send it on a NEW thread of its
   own, leaving the older draft pending"), so the prose contemplated a backlog
   the data structure could not represent.

   The single slot was also, accidentally, the only cap on how many posts could
   be in front of the reviewer. Replacing it with an unbounded array would turn
   one failure into another: a reviewer who stops replying would collect a post
   a week forever. MAX_PENDING is that cap, stated rather than implied. */
export const MAX_PENDING = 3;

/** Every pending post, whatever shape the state file is in. */
export function pendingPosts(state) {
  const a = state?.awaiting;
  if (!a) return [];
  return (Array.isArray(a) ? a : [a]).filter(Boolean);
}

/** The queue, as an object the caller can write. Never mutates its input. */
const withQueue = (state, posts) => ({ ...(state ?? {}), awaiting: posts });

/** Add a post, or replace the entry for a slug already queued. */
export function addPendingTo(state, entry) {
  const rest = pendingPosts(state).filter((p) => p.slug !== entry.slug);
  return withQueue(state, [...rest, { ...entry }]);
}

/** Drop a post from the queue — publishing it, or abandoning it. */
export function resolvePendingIn(state, slug) {
  return withQueue(state, pendingPosts(state).filter((p) => p.slug !== slug));
}

/** Patch one queued post, leaving every other entry byte-identical. */
export function updatePendingIn(state, slug, patch) {
  return withQueue(
    state,
    pendingPosts(state).map((p) => (p.slug === slug ? { ...p, ...patch } : p)),
  );
}

/** Look a post up by slug or by thread id — the watcher has the thread. */
export function findPending(state, key) {
  return pendingPosts(state).find((p) => p.slug === key || p.threadId === key);
}

export function readState() {
  if (!existsSync(STATE)) return { awaiting: [] };
  try {
    return JSON.parse(readFileSync(STATE, 'utf8'));
  } catch {
    /* A corrupt state file must not read as "nothing pending" — that would
       silently abandon a post already sent for review. */
    return { awaiting: [], corrupt: true };
  }
}

export function writeState(s) {
  /* Normalise on the way out, so a file written by any caller — including the
     legacy `writeState({ awaiting: null })` still in older task prompts —
     converges on the queue shape instead of reverting the file to a single
     slot. */
  const normalised = { ...(s ?? {}), awaiting: pendingPosts(s) };
  mkdirSync(dirname(STATE), { recursive: true });
  writeFileSync(STATE, JSON.stringify(normalised, null, 2) + '\n', 'utf8');
  return normalised;
}

/* Read-modify-write wrappers. The pure functions above are what the tests
   exercise: a helper that reached the real state file could not be tested
   without clobbering a post genuinely out for review. */
export const addPending = (entry) => writeState(addPendingTo(readState(), entry));
export const resolvePending = (slug) => writeState(resolvePendingIn(readState(), slug));
export const updatePending = (slug, patch) => writeState(updatePendingIn(readState(), slug, patch));

/**
 * Should this tick check the mail thread?
 * @param {object} state   from readState()
 * @param {Date}   now     injected, never read from the clock here — a function
 *                         that reads the clock internally cannot be tested.
 */
/* One post's own decay. Each queued post ages on its own clock: a draft past
   the hot window going quiet must not silence a second one sent an hour ago,
   which the single slot could not express at all. */
function checkOnePost(p, now) {
  const sentAt = new Date(p.sentAt);
  if (Number.isNaN(sentAt.getTime())) {
    return { check: true, phase: 'bad-timestamp', reason: 'sentAt unparseable — treat as hot' };
  }
  const ageHours = (now.getTime() - sentAt.getTime()) / 3_600_000;

  if (ageHours < HOT_WINDOW_HOURS) {
    return { check: true, phase: 'hot', ageHours: Math.round(ageHours * 10) / 10,
             reason: `within the ${HOT_WINDOW_HOURS}h window` };
  }
  /* Cold phase: one check a day. The cron still fires on its own schedule, and
     all but one tick an hour returns false, so the daily check is at most one
     tick late rather than skipped. */
  if (now.getHours() === DAILY_SLOT_HOUR && now.getMinutes() < 10) {
    return { check: true, phase: 'cold-daily', ageHours: Math.round(ageHours),
             reason: `past ${HOT_WINDOW_HOURS}h — daily slot` };
  }
  return { check: false, phase: 'cold-quiet', ageHours: Math.round(ageHours),
           reason: `past ${HOT_WINDOW_HOURS}h — next check at ${DAILY_SLOT_HOUR}:00` };
}

/* Loudest first: a phase that demands attention must not be hidden behind a
   quieter one on another post. */
const PHASE_RANK = { 'bad-timestamp': 0, hot: 1, 'cold-daily': 2, 'cold-quiet': 3 };

export function shouldCheck(state, now) {
  if (state?.corrupt) {
    return { check: true, phase: 'corrupt-state', posts: [],
             reason: 'state file unreadable — check and repair' };
  }
  const posts = pendingPosts(state).map((p) => ({
    slug: p.slug, threadId: p.threadId, revision: p.revision, ...checkOnePost(p, now),
  }));
  if (posts.length === 0) {
    return { check: false, phase: 'idle', posts: [], reason: 'no post awaiting review' };
  }

  const due = posts.filter((p) => p.check);
  const lead = [...posts].sort((a, b) => PHASE_RANK[a.phase] - PHASE_RANK[b.phase])[0];
  const reason = due.length === 0
    ? `${posts.length} awaiting, none due — ${lead.reason}`
    : posts.length === 1
      ? lead.reason
      : `${due.length} of ${posts.length} due: ${due.map((p) => p.slug).join(', ')}`;

  return { check: due.length > 0, phase: lead.phase, ageHours: lead.ageHours, posts, reason };
}

/* Everything below a quote marker was written by US, not by the reviewer.
   This matters more than it looks: every review email we send ends with
   "Reply APPROVE to publish, or REJECT with what you want changed", and Gmail
   quotes the whole thing underneath the reply. So the quoted text reliably
   contains BOTH keywords, and a one-word "Approve" came back as ambiguous.
   Worse, the classifier reads a fixed 400-character window, so which keyword
   it reaches depends on how long the reviewer's signature happens to be —
   the verdict was a function of the signature block, which is not a property
   of the reply at all. Strip the quote first, then classify what is left. */
export function stripQuotedReply(text) {
  const raw = (text || '').replace(/\r\n/g, '\n');
  const markers = [
    /* Gmail wraps this header when the address is long, so it is not reliably
       one line: "On Tue, 10 Nov 2026 at 11:31 AM, Name <\naddress> wrote:".
       Cross the break rather than anchoring to a single line — bounded, and
       still required to end a line on "wrote:". */
    /^[ \t]*On\s[\s\S]{0,300}?\bwrote:[ \t]*$/m,   // Gmail / Apple Mail
    /^\s*-{2,}\s*Original Message\s*-{2,}/im,
    /^\s*_{10,}\s*$/m,                   // Outlook's rule
    /^\s*From:\s.+$/m,                   // forwarded header block
    /^\s*Sent from my /m,
  ];
  let cut = raw.length;
  for (const m of markers) {
    const hit = raw.search(m);
    if (hit !== -1 && hit < cut) cut = hit;
  }
  return raw
    .slice(0, cut)
    .split('\n')
    .filter((l) => !/^\s*>/.test(l))     // quoted lines anywhere above the marker
    .join('\n')
    .trim();
}

/** Classify a human reply. Ambiguity resolves to ASK, never to publish. */
export function classifyReply(text) {
  const t = stripQuotedReply(text);
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

  const pending = pendingPosts(state);
  const pendingCount = pending.length;
  const slugs = pending.map((p) => p.slug);

  if (pendingCount === 0) {
    return { action: 'produce', outcome: 'PRODUCE', ageDays: null, pendingCount, slugs,
             reason: 'nothing awaiting review' };
  }

  /* An unreadable timestamp cannot be aged, so it cannot be shown to have been
     waiting a short time. Escalate rather than skip quietly — and check every
     queued post, not just the first, or one bad entry hides behind a good one. */
  const unageable = pending.find((p) => Number.isNaN(new Date(p.sentAt).getTime()));
  if (unageable) {
    return {
      action: 'escalate', outcome: 'ESCALATE', ageDays: null, pendingCount, slugs,
      reason: `${unageable.slug} is awaiting review but its sentAt (${unageable.sentAt}) will not parse`,
    };
  }

  /* The queue is judged by its OLDEST post. A fresh draft must not reset the
     clock on one that has been ignored for a fortnight — otherwise a steady
     cadence of new posts would keep an abandoned one permanently young. */
  const oldest = pending.reduce((a, b) => (new Date(a.sentAt) <= new Date(b.sentAt) ? a : b));
  const ageDays =
    Math.round(((now.getTime() - new Date(oldest.sentAt).getTime()) / 86_400_000) * 10) / 10;
  /* A full queue must never be reportable in the same words as a one-post
     queue, including on the branches that are not the capacity escalation. A
     queue of three FRESH posts correctly returns skip — producing nothing is
     right — but "waiting on one" and "waiting on the maximum" are different
     situations for whoever reads the outcome line. */
  const atCapacity = pendingCount >= MAX_PENDING;
  const queue =
    pendingCount === 1
      ? ''
      : ` (${pendingCount} awaiting${atCapacity ? `, at capacity of ${MAX_PENDING}` : ''}: ${slugs.join(', ')})`;

  if (ageDays < STALE_AFTER_DAYS) {
    return {
      action: 'skip', outcome: 'SKIP', ageDays, pendingCount, slugs,
      reason: `${oldest.slug} has been with the reviewer ${ageDays}d, under the ${STALE_AFTER_DAYS}d mark${queue}`,
    };
  }

  if (ageDays < RELEASE_AFTER_DAYS) {
    return {
      action: 'escalate', outcome: 'ESCALATE', ageDays, pendingCount, slugs,
      reason: `${oldest.slug} has been unanswered ${ageDays}d, past ${STALE_AFTER_DAYS}d — chase it on its existing thread, and do not add a second post to that thread${queue}`,
    };
  }

  /* The cap the single slot used to provide by accident. At capacity, another
     post would not unblock anything; it would just add a fourth thing the
     reviewer is not answering. Chase instead. */
  if (pendingCount >= MAX_PENDING) {
    return {
      action: 'escalate', outcome: 'ESCALATE', ageDays, pendingCount, slugs,
      reason: `the review queue is at capacity (${pendingCount} of ${MAX_PENDING}): ${slugs.join(', ')} — chase these before writing another`,
    };
  }

  /* Past two cycles the hold costs more than the clash it was preventing. The
     new post goes out on its OWN thread, so the reviewer still never has two
     posts in one thread to untangle, and the old draft stays queued rather
     than being thrown away — which is now literally true, not aspirational. */
  return {
    action: 'release', outcome: 'RELEASE', ageDays, pendingCount, slugs,
    reason: `${oldest.slug} has been unanswered ${ageDays}d, past ${RELEASE_AFTER_DAYS}d — produce this week's post on a NEW thread and leave the old one queued${queue}`,
  };
}

/** The one line a weekly run must print, so a skip can never read as a post. */
export function weeklyOutcomeLine(decision) {
  const age = decision.ageDays === null ? '' : ` after ${decision.ageDays}d`;
  return `OUTCOME: ${decision.outcome}${age} — ${decision.reason}`;
}
