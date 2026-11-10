import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    globals: false,
    /* The review state machine's cold-phase check reads now.getHours() in LOCAL
       time, so any test that pins a phase is a claim about the host's zone
       unless the zone is fixed. Measured: the mixed hot/cold case in
       blogReviewQueue.test.ts passes at UTC-4 and UTC, and fails at UTC-3,
       where 12:00Z is 09:00 local and lands in the daily slot. Pin it, so a
       green suite here means a green suite on the CI runner and on a laptop
       that travelled. */
    env: { TZ: 'UTC' },
  },
});
