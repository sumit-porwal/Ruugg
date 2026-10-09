import type { SemanticTag } from '../types';

export interface SemanticTagMeta {
  id: SemanticTag;
  label: string;
  shortLabel: string;
  iconName: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const SEMANTIC_TAGS_MAP: Record<SemanticTag, SemanticTagMeta> = {
  fact: {
    id: 'fact',
    label: 'Fact',
    shortLabel: 'FACT',
    iconName: 'CheckCircle2',
    description: 'Observed reality, verified data or proven ground truth',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  assumption: {
    id: 'assumption',
    label: 'Assumption',
    shortLabel: 'ASSUMPTION',
    iconName: 'AlertCircle',
    description: 'Belief taken for granted without direct verification',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  hypothesis: {
    id: 'hypothesis',
    label: 'Hypothesis',
    shortLabel: 'HYPOTHESIS',
    iconName: 'Sparkles',
    description: 'Proposed explanation to test, investigate or validate',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
  },
  question: {
    id: 'question',
    label: 'Open Question',
    shortLabel: 'QUESTION',
    iconName: 'HelpCircle',
    description: 'Unresolved unknown or inquiry needing an answer',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  evidence_needed: {
    id: 'evidence_needed',
    label: 'Evidence Needed',
    shortLabel: 'NEEDS PROOF',
    iconName: 'Search',
    description: 'Claim requiring empirical data, metrics or citation',
    color: '#e11d48',
    bgColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  decision: {
    id: 'decision',
    label: 'Decision',
    shortLabel: 'DECISION',
    iconName: 'Award',
    description: 'Choice made or commitment agreed upon',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  action: {
    id: 'action',
    label: 'Action Item',
    shortLabel: 'ACTION',
    iconName: 'CheckSquare',
    description: 'Concrete next task, test or assignment with clear owner',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
};

export const SEMANTIC_TAG_LIST = Object.values(SEMANTIC_TAGS_MAP);
