import { describe, it, expect } from 'vitest';
import {
  decideWeeklyRun,
  weeklyOutcomeLine,
  STALE_AFTER_DAYS,
  RELEASE_AFTER_DAYS,
} from '../../scripts/blog-review-state.mjs';

/* The weekly run used to decide this in prose: if a post is awaiting review,
   stop. That holds for a week and fails forever. On 2026-10-20 it fired, found
   the previous day's draft unanswered, stopped, and reported success in five
   and a half minutes — against about thirty for a run that writes a post. From
   outside, a blog that had quietly stopped looked exactly like one that was
   working. These tests exist so the three cases stay distinguishable. */

const NOW = new Date('2026-10-26T13:00:00Z');
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();
const awaiting = (d: number) => ({ awaiting: { slug: 'a-post', sentAt: daysAgo(d) } });

describe('what this Monday should do', () => {
  it('writes a post when nothing is pending', () => {
    expect(decideWeeklyRun({ awaiting: null }, NOW).action).toBe('produce');
  });

  it('waits while the reviewer still plausibly has it', () => {
    const d = decideWeeklyRun(awaiting(1), NOW);
    expect(d.action).toBe('skip');
    expect(d.ageDays).toBe(1);
  });

  it(`chases it once silence passes ${STALE_AFTER_DAYS} days`, () => {
    expect(decideWeeklyRun(awaiting(STALE_AFTER_DAYS), NOW).action).toBe('escalate');
    expect(decideWeeklyRun(awaiting(STALE_AFTER_DAYS + 3), NOW).action).toBe('escalate');
  });

  it(`stops being held shut after ${RELEASE_AFTER_DAYS} days`, () => {
    /* The point of the whole change: two cycles of silence must not mean a
       blog that never posts again. */
    expect(decideWeeklyRun(awaiting(RELEASE_AFTER_DAYS), NOW).action).toBe('release');
    expect(decideWeeklyRun(awaiting(60), NOW).action).toBe('release');
  });

  it('never silently skips on a state file it cannot read', () => {
    /* Corrupt state might be hiding a post already sent, so producing another
       is wrong — but so is a quiet skip, which is what used to happen. */
    const d = decideWeeklyRun({ awaiting: null, corrupt: true }, NOW);
    expect(d.action).toBe('halt');
    expect(d.outcome).toBe('BLOCKED');
  });

  it('never silently skips on a timestamp it cannot age', () => {
    const d = decideWeeklyRun({ awaiting: { slug: 'x', sentAt: 'whenever' } }, NOW);
    expect(d.action).toBe('escalate');
  });

  it('gives a skip and a post different outcome lines', () => {
    /* This is the actual defect, stated as a test: a run that produced nothing
       must not be reportable in the same words as one that produced a post. */
    const produced = weeklyOutcomeLine(decideWeeklyRun({ awaiting: null }, NOW));
    const skipped = weeklyOutcomeLine(decideWeeklyRun(awaiting(1), NOW));
    expect(produced).not.toEqual(skipped);
    expect(produced).toMatch(/^OUTCOME: PRODUCE/);
    expect(skipped).toMatch(/^OUTCOME: SKIP/);
    expect(skipped).toContain('1d');
  });

  it('says how long it has been waiting, in every waiting case', () => {
    for (const days of [1, 6.9, 7, 13.9, 14, 30]) {
      const d = decideWeeklyRun(awaiting(days), NOW);
      expect(weeklyOutcomeLine(d), `${days}d`).toMatch(/after [\d.]+d/);
    }
  });
});
