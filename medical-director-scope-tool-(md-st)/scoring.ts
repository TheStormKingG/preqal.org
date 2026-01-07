
import { OptionKey, SalaryBand } from './types';

/**
 * DETERMINISTIC SCORING RULES:
 * 1. Count A/B/C selections.
 * 2. If C count >= 3 -> Band C.
 * 3. If Q2 or Q3 is 'C', Band A is ruled out (Min Band B).
 * 4. "Mostly" is the highest count among A/B/C.
 * 5. TIE-BREAK: Choose the higher band (C > B > A).
 */
export function calculateSalaryBand(answers: Record<string, OptionKey>): SalaryBand {
  const counts = { A: 0, B: 0, C: 0 };
  Object.values(answers).forEach((val) => {
    counts[val]++;
  });

  // Rule: Any 3 or more C answers -> Band C
  if (counts.C >= 3) return 'C';

  // Find "Mostly"
  let mostly: SalaryBand = 'A';
  if (counts.B >= counts.A && counts.B >= counts.C) {
    mostly = 'B';
  } else if (counts.C >= counts.A && counts.C >= counts.B) {
    mostly = 'C';
  } else {
    mostly = 'A';
  }

  // Handle Ties Specifically (Higher band wins)
  // Example: 3A, 3B, 0C -> Counts are equal, result is B.
  // Example: 2A, 2B, 2C -> Already handled by counts.C >= 3 above? No, 2C is not >= 3. 
  // If 2A, 2B, 2C -> Tie-break C wins.
  const maxCount = Math.max(counts.A, counts.B, counts.C);
  if (counts.C === maxCount) mostly = 'C';
  else if (counts.B === maxCount) mostly = 'B';
  else mostly = 'A';

  // Rule: C in Q2 or Q3 rules out Band A
  if (answers['Q2'] === 'C' || answers['Q3'] === 'C') {
    if (mostly === 'A') return 'B';
  }

  return mostly;
}

/**
 * TEST CASES Logic:
 * 1. [A, A, A, A, A, A] -> Result: A
 * 2. [C, C, C, A, A, A] -> Result: C (3 or more C's)
 * 3. [B, B, B, A, A, A] -> Result: B (Tie B vs A, B wins)
 * 4. [A, A, A, A, A, C(Q2)] -> Result: B (Q2=C rules out A)
 * 5. [B, B, A, A, C, C] -> Result: B (Tie B vs C, C wins -> actually 2Cs tie but B is also 2? Max count check)
 *    Wait, if counts are [2, 2, 2], C wins.
 * 6. [A, A, B, B, B, B] -> Result: B (Mostly B)
 */
