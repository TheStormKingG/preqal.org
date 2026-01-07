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
