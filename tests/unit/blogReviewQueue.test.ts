import { describe, it, expect } from 'vitest';
import {
  pendingPosts,
  addPendingTo,
  resolvePendingIn,
  updatePendingIn,
  findPending,
  shouldCheck,
  decideWeeklyRun,
  MAX_PENDING,
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
       window and one just sent. The tick must still act on the new one. */
    const cold = new Date('2026-11-10T12:00:00Z'); // not the daily slot hour
    const mixed = addPendingTo(addPendingTo({ awaiting: null }, post('old', 9)), post('new', 0.1));
    const d = shouldCheck(mixed, cold);
    expect(d.check, 'the tick must act').toBe(true);
    const byslug = Object.fromEntries(d.posts.map((p: { slug: string }) => [p.slug, p]));
    expect(byslug.new.check).toBe(true);
    expect(byslug.old.check).toBe(false);
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
    expect(d.reason).toMatch(/capacity|full|3/);
  });

  it(`still releases at ${RELEASE_AFTER_DAYS} days when there is room`, () => {
    const one = addPendingTo({ awaiting: null }, post('a', RELEASE_AFTER_DAYS));
    expect(decideWeeklyRun(one, NOW).action).toBe('release');
  });

  it(`still chases between ${STALE_AFTER_DAYS} and ${RELEASE_AFTER_DAYS} days`, () => {
    const one = addPendingTo({ awaiting: null }, post('a', STALE_AFTER_DAYS + 1));
    expect(decideWeeklyRun(one, NOW).action).toBe('escalate');
  });

  it('escalates when any queued post has an unageable timestamp', () => {
    const bad = addPendingTo({ awaiting: null }, { ...post('a', 0), sentAt: 'whenever' });
    expect(decideWeeklyRun(bad, NOW).action).toBe('escalate');
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
