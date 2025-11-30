import React from 'react';

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
}

export interface CaseStudy {
  id: string;
  client: string;
  sector: string;
  title: string;
  challenge: string;
  solution: string;
  metrics: { label: string; value: string }[];
  beforeScore: number;
  afterScore: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'Template' | 'Tool';
  description: string;
}