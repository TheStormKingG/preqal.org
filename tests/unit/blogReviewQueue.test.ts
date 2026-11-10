import { describe, it, expect } from 'vitest';
import {
  pendingPosts,
  addPendingTo,
  resolvePendingIn,
  updatePendingIn,
  findPending,
  shouldCheck,
  decideWeeklyRun,
  weeklyOutcomeLine,
  MAX_PENDING,
  DAILY_SLOT_HOUR,
  STALE_AFTER_DAYS,
  RELEASE_AFTER_DAYS,
} from '../../scripts/blog-review-state.mjs';

/* `awaiting` used to hold one post. On 2026-11-10 two drafts were out for
   review at once — one recovered from a run that could not write to disk, one
   written the week before — and only one could be watched. A reply on the
   other thread would have been seen by nothing.

   The weekly task's own `release` state already described exactly that
   situation ("send it on a NEW thread of its own, leaving the older draft
   pending"), so the prose contemplated a backlog the data structure could not
   represent. These tests pin the queue shape, and the legacy shape it has to
   keep reading, because state files written before this change are still on
   disk. */

const NOW = new Date('2026-11-10T12:00:00Z');
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();
const post = (slug: string, d: number) => ({
  slug,
  threadId: `thread-${slug}`,
  sentAt: daysAgo(d),
  revision: 1,
});

describe('the review queue holds more than one post', () => {
  it('reads the legacy single-object shape as a one-item queue', () => {
    expect(pendingPosts({ awaiting: post('old', 1) }).map((p) => p.slug)).toEqual(['old']);
  });

  it('reads null and the empty array as an empty queue', () => {
    expect(pendingPosts({ awaiting: null })).toEqual([]);
    expect(pendingPosts({ awaiting: [] })).toEqual([]);
    expect(pendingPosts({})).toEqual([]);
  });

  it('holds two posts at once', () => {
    const s = addPendingTo(addPendingTo({ awaiting: null }, post('a', 2)), post('b', 0));
    expect(pendingPosts(s).map((p) => p.slug)).toEqual(['a', 'b']);
  });

  it('adds onto a legacy single-object state without losing the original', () => {
    /* The migration path that actually happens: a state file written by the
       old code, then a second post sent before anyone converts it. */
    const s = addPendingTo({ awaiting: post('legacy', 3) }, post('new', 0));
    expect(pendingPosts(s).map((p) => p.slug)).toEqual(['legacy', 'new']);
  });

  it('re-adding the same slug replaces it rather than duplicating it', () => {
    const s = addPendingTo(addPendingTo({ awaiting: null }, post('a', 5)), {
      ...post('a', 0),
      revision: 2,
    });
    expect(pendingPosts(s)).toHaveLength(1);
    expect(pendingPosts(s)[0].revision).toBe(2);
  });

  it('resolving one post leaves the other watched — the whole point', () => {
    const two = addPendingTo(addPendingTo({ awaiting: null }, post('a', 2)), post('b', 0));
    const after = resolvePendingIn(two, 'a');
    expect(pendingPosts(after).map((p) => p.slug)).toEqual(['b']);
  });

  it('resolving the last post empties the queue', () => {
    const one = addPendingTo({ awaiting: null }, post('a', 1));
    expect(pendingPosts(resolvePendingIn(one, 'a'))).toEqual([]);
  });

  it('resolving a slug that is not queued changes nothing', () => {
    const one = addPendingTo({ awaiting: null }, post('a', 1));
    expect(pendingPosts(resolvePendingIn(one, 'ghost')).map((p) => p.slug)).toEqual(['a']);
  });

  it('bumps a revision on one post without touching the other', () => {
    const two = addPendingTo(addPendingTo({ awaiting: null }, post('a', 2)), post('b', 0));
    const after = updatePendingIn(two, 'a', { revision: 2, sentAt: daysAgo(0) });
    expect(findPending(after, 'a')!.revision).toBe(2);
    expect(findPending(after, 'b')!.revision).toBe(1);
    expect(findPending(after, 'b')!.sentAt).toBe(two.awaiting[1].sentAt);
  });

  it('finds a post by slug or by thread id', () => {
    const two = addPendingTo(addPendingTo({ awaiting: null }, post('a', 2)), post('b', 0));
    expect(findPending(two, 'b')!.slug).toBe('b');
    expect(findPending(two, 'thread-a')!.slug).toBe('a');
    expect(findPending(two, 'nope')).toBeUndefined();
  });
});

describe('which pending posts this tick should check', () => {
  it('is idle on an empty queue', () => {
    const d = shouldCheck({ awaiting: [] }, NOW);
    expect(d.check).toBe(false);
    expect(d.phase).toBe('idle');
    expect(d.posts).toEqual([]);
  });

  it('reports one entry per pending post', () => {
    const two = addPendingTo(addPendingTo({ awaiting: null }, post('a', 0.5)), post('b', 0.1));
    const d = shouldCheck(two, NOW);
    expect(d.posts.map((p: { slug: string }) => p.slug)).toEqual(['a', 'b']);
    expect(d.check).toBe(true);
  });

  it('checks the hot post even when an older one has gone quiet', () => {
    /* The mixed case the single slot could not express: one post past the hot
       window and one just sent. The tick must still act on the new one.

       The clock matters and used to be accidental. `now` has to be outside the
       DAILY_SLOT_HOUR window or the old post lands in cold-daily and is also
       due. This read 12:00Z, which is hour 12 here and at UTC — and hour 9 at
       UTC-3, where this test failed. vitest.config.ts now pins TZ=UTC, so the
       hour below is the hour the code sees. */
    const quietHour = new Date('2026-11-10T12:00:00Z');
    expect(quietHour.getHours(), 'the fixture must not sit in the daily slot').not.toBe(
      DAILY_SLOT_HOUR,
    );
    const mixed = addPendingTo(addPendingTo({ awaiting: null }, post('old', 9)), post('new', 0.1));
    const d = shouldCheck(mixed, quietHour);
    expect(d.check, 'the tick must act').toBe(true);
    const byslug = Object.fromEntries(d.posts.map((p: { slug: string }) => [p.slug, p]));
    expect(byslug.new.check).toBe(true);
    expect(byslug.old.check).toBe(false);
    /* The loudest phase must surface, or a hot post hides behind a quiet one
       in everything that reads the top-level decision. Reversing PHASE_RANK
       left the whole suite green before this line existed. */
    expect(d.phase, 'the summary phase is the loudest, not the first').toBe('hot');
  });

  it('a post with an unageable timestamp outranks a merely hot one', () => {
    const mixed = addPendingTo(addPendingTo({ awaiting: null }, post('fine', 0.1)), {
      ...post('broken', 0),
      sentAt: 'whenever',
    });
    expect(shouldCheck(mixed, NOW).phase).toBe('bad-timestamp');
  });

  it('keeps checking a cold post once a day, in the daily slot', () => {
    /* The only thing keeping a post alive past the 48h hot window. Deleting
       this branch from the module left the entire suite green, which meant
       nothing was pinning the one mechanism that stops a cold post going
       unread forever — the exact silent failure this pipeline already had. */
    const inSlot = new Date(`2026-11-10T0${DAILY_SLOT_HOUR}:05:00Z`);
    expect(inSlot.getHours()).toBe(DAILY_SLOT_HOUR);
    const cold = addPendingTo({ awaiting: null }, post('cold', 9));
    const due = shouldCheck(cold, inSlot);
    expect(due.check, 'a cold post is checked in the slot').toBe(true);
    expect(due.phase).toBe('cold-daily');

    /* And the slot is ten minutes wide, not the whole hour. */
    const pastSlot = new Date(`2026-11-10T0${DAILY_SLOT_HOUR}:10:00Z`);
    const quiet = shouldCheck(cold, pastSlot);
    expect(quiet.check).toBe(false);
    expect(quiet.phase).toBe('cold-quiet');
  });

  it('still surfaces a corrupt state file', () => {
    const d = shouldCheck({ awaiting: null, corrupt: true }, NOW);
    expect(d.check).toBe(true);
    expect(d.phase).toBe('corrupt-state');
  });
});

describe('what Monday does with a queue', () => {
  it('produces on an empty queue', () => {
    expect(decideWeeklyRun({ awaiting: [] }, NOW).action).toBe('produce');
  });

  it('decides on the oldest post in the queue', () => {
    /* A fresh second post must not reset the clock on a draft that has been
       ignored for a fortnight. */
    const mixed = addPendingTo(
      addPendingTo({ awaiting: null }, post('ancient', RELEASE_AFTER_DAYS + 1)),
      post('fresh', 0),
    );
    const d = decideWeeklyRun(mixed, NOW);
    expect(d.ageDays).toBeGreaterThanOrEqual(RELEASE_AFTER_DAYS);
    expect(d.reason).toContain('ancient');
  });

  it('skips while the oldest is still fresh, and counts the queue', () => {
    const two = addPendingTo(addPendingTo({ awaiting: null }, post('a', 1)), post('b', 0));
    const d = decideWeeklyRun(two, NOW);
    expect(d.action).toBe('skip');
    expect(d.pendingCount).toBe(2);
  });

  it(`escalates rather than releasing once the queue holds ${MAX_PENDING}`, () => {
    /* The single slot was itself the cap. Removing it without replacing it
       would let a reviewer who stops replying accumulate a post a week
       forever, which is a different failure, not a fixed one. */
    let s: { awaiting: unknown } = { awaiting: null };
    for (let i = 0; i < MAX_PENDING; i += 1) {
      s = addPendingTo(s, post(`p${i}`, RELEASE_AFTER_DAYS + 1));
    }
    const d = decideWeeklyRun(s, NOW);
    expect(d.action, 'must not add a fourth').not.toBe('release');
    expect(d.action).toBe('escalate');
    /* Was /capacity|full|3/, which the "3 awaiting" suffix satisfies on any
       three-post queue — it passed without the capacity branch existing. */
    expect(d.reason).toContain('capacity');
  });

  it('a full queue of FRESH posts still skips, and says it is full', () => {
    /* The capacity escalation only fires once the oldest is past RELEASE, so
       this is the other full-queue case. Producing nothing is the right
       action; the point of the test is that it is deliberate, and that the
       outcome line distinguishes a full queue from a single pending post. */
    let s: { awaiting: unknown } = { awaiting: null };
    for (let i = 0; i < MAX_PENDING; i += 1) s = addPendingTo(s, post(`p${i}`, i + 1));
    const d = decideWeeklyRun(s, NOW);
    expect(d.action).toBe('skip');
    expect(d.pendingCount).toBe(MAX_PENDING);
    expect(weeklyOutcomeLine(d)).toContain('at capacity');
  });

  it('gives every decision shape its own outcome line', () => {
    /* weeklyOutcomeLine exists so a run that produced nothing cannot be
       reported in the same words as one that produced a post. It was only
       ever asserted for PRODUCE against SKIP, so the shapes this change added
       were unpinned. */
    const fresh = addPendingTo({ awaiting: null }, post('a', 1));
    const stale = addPendingTo({ awaiting: null }, post('a', STALE_AFTER_DAYS + 1));
    const released = addPendingTo({ awaiting: null }, post('a', RELEASE_AFTER_DAYS + 1));
    let full: { awaiting: unknown } = { awaiting: null };
    for (let i = 0; i < MAX_PENDING; i += 1) {
      full = addPendingTo(full, post(`p${i}`, RELEASE_AFTER_DAYS + 1 + i));
    }
    const unageable = addPendingTo({ awaiting: null }, { ...post('a', 0), sentAt: 'whenever' });

    const lines = [
      { awaiting: [] },
      fresh,
      stale,
      released,
      full,
      unageable,
      { awaiting: [], corrupt: true },
    ].map((s) => weeklyOutcomeLine(decideWeeklyRun(s, NOW)));

    expect(new Set(lines).size, `duplicate outcome lines:\n${lines.join('\n')}`).toBe(lines.length);
    expect(lines.every((l) => l.startsWith('OUTCOME: '))).toBe(true);
  });

  it(`still releases at ${RELEASE_AFTER_DAYS} days when there is room`, () => {
    const one = addPendingTo({ awaiting: null }, post('a', RELEASE_AFTER_DAYS));
    expect(decideWeeklyRun(one, NOW).action).toBe('release');
  });

  it(`still chases between ${STALE_AFTER_DAYS} and ${RELEASE_AFTER_DAYS} days`, () => {
    const one = addPendingTo({ awaiting: null }, post('a', STALE_AFTER_DAYS + 1));
    expect(decideWeeklyRun(one, NOW).action).toBe('escalate');
  });

  it('escalates when ANY queued post has an unageable timestamp, not just the first', () => {
    /* A one-post fixture cannot tell `pending.find(...)` from
       `[pending[0]].find(...)`. With a good post first and the broken one
       second, the first-only version returns skip and the bad entry ages
       forever unnoticed. */
    const mixed = addPendingTo(addPendingTo({ awaiting: null }, post('good', 1)), {
      ...post('corrupt', 0),
      sentAt: 'whenever',
    });
    const d = decideWeeklyRun(mixed, NOW);
    expect(d.action).toBe('escalate');
    expect(d.reason).toContain('corrupt');

    // And the symmetric case, so neither end of the queue is privileged.
    const flipped = addPendingTo(
      addPendingTo({ awaiting: null }, { ...post('corrupt', 0), sentAt: 'whenever' }),
      post('good', 1),
    );
    expect(decideWeeklyRun(flipped, NOW).action).toBe('escalate');
  });
});

describe('the pure helpers do not touch the state file', () => {
  it('leaves the caller-supplied state object unmutated', () => {
    /* These run against the live review-state.json's module. If a helper wrote
       to disk, a test run would clobber a real post that is out for review. */
    const original = { awaiting: [post('a', 1)] };
    const snapshot = JSON.stringify(original);
    addPendingTo(original, post('b', 0));
    resolvePendingIn(original, 'a');
    updatePendingIn(original, 'a', { revision: 9 });
    expect(JSON.stringify(original)).toBe(snapshot);
  });
});
