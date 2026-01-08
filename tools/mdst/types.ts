export type OptionKey = 'A' | 'B' | 'C';

export interface Option {
  id: OptionKey;
  label: string;
  description: string;
}

export interface Question {
  id: string;
  category: string;
  text: string;
  clarification?: string; // Simple explanation to help users understand the question
  options: Option[];
}

export type SalaryBand = 'A' | 'B' | 'C';

export interface BandDetails {
  band: SalaryBand;
  range: string;
  title: string;
  description: string;
  responsibilities: string[];
}

export interface AssessmentResult {
  band: SalaryBand;
  answers: Record<string, OptionKey>;
}
