import { describe, it, expect } from 'vitest';
import { wickRun } from '../../lib/wickRun';

describe('wickRun()', () => {
  it('burns the stretch above the badge when moving down the deck', () => {
    expect(wickRun(false, true)).toEqual({ segment: 'above', hiddenOffset: 1, originEntry: false });
  });

  it('burns the stretch below the badge, from the bottom up, when moving back up', () => {
    expect(wickRun(false, false)).toEqual({ segment: 'below', hiddenOffset: -1, originEntry: false });
  });

  it('lights phase 01 first and runs downward out of it when reached going forward', () => {
    expect(wickRun(true, true)).toEqual({ segment: 'below', hiddenOffset: 1, originEntry: true });
  });

  it('reaches phase 01 from below like any other phase when coming back up', () => {
    expect(wickRun(true, false)).toEqual({ segment: 'below', hiddenOffset: -1, originEntry: false });
  });

  it('always draws from the far end when travelling up, so the flame runs bottom-to-top', () => {
    for (const isOrigin of [true, false]) {
      expect(wickRun(isOrigin, false).hiddenOffset).toBe(-1);
      expect(wickRun(isOrigin, false).segment).toBe('below');
    }
  });

  it('only treats phase 01 as the origin when it is entered going forward', () => {
    expect(wickRun(true, true).originEntry).toBe(true);
    expect(wickRun(true, false).originEntry).toBe(false);
    expect(wickRun(false, true).originEntry).toBe(false);
  });
});
