export type StandardChipIcon = 'check' | 'leaf';

export type StandardChipItem = {
  id: string;
  label: string;
  definition: string;
  icon: StandardChipIcon;
};

export const GLOBAL_STANDARDS_DATA: StandardChipItem[] = [
  { id: 'iso-9001', label: 'ISO 9001', definition: 'You understand quality systems; create consistent results, improve confidently.', icon: 'check' },
  { id: 'iso-45001', label: 'ISO 45001', definition: 'You protect people wisely; prevent harm, build safe workplaces daily.', icon: 'check' },
  { id: 'iso-14001', label: 'ISO 14001', definition: 'You think sustainably; reduce impact, protect environment with smart choices.', icon: 'check' },
  { id: 'haccp', label: 'HACCP', definition: 'You ensure safe food; control risks, protect health every step.', icon: 'check' },
  { id: 'climate-friendliness', label: 'Climate', definition: 'You act responsibly; reduce waste, protect planet, create sustainable future.', icon: 'leaf' },
];
