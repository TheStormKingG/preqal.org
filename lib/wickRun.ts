/* Which stretch of the phase wick burns, and which way the flame travels.
 *
 * The reader drives the direction: moving down the deck the flame arrives from
 * above the badge; moving back up it arrives from below. Phase 01 is where the
 * wick originates, so when it is reached going forward its badge lights first
 * and the flame runs downward out of it instead of into it. */

export type WickSegment = 'above' | 'below';

export interface WickRun {
  /** The stretch of wick that burns: above the badge, or below it. */
  segment: WickSegment;
  /** stroke-dashoffset while hidden — 1 draws a path from its start, -1 from its far end. */
  hiddenOffset: 1 | -1;
  /** Phase 01 reached going forward: the badge pops first, then the wick runs out of it. */
  originEntry: boolean;
}

export const wickRun = (isOrigin: boolean, goingDown: boolean): WickRun => ({
  segment: goingDown && !isOrigin ? 'above' : 'below',
  hiddenOffset: goingDown ? 1 : -1,
  originEntry: isOrigin && goingDown,
});
