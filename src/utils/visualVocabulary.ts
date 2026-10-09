export interface StampDefinition {
  id: string;
  name: string;
  category: 'people' | 'symbols' | 'arrows' | 'frames';
  icon: string; // lucide icon identifier or SVG path description
  defaultSize: number;
}

export const VISUAL_VOCABULARY_STAMPS: StampDefinition[] = [
  // People & Roles
  { id: 'user', name: 'Person', category: 'people', icon: 'User', defaultSize: 64 },
  { id: 'users', name: 'Team / Crowd', category: 'people', icon: 'Users', defaultSize: 72 },
  { id: 'smile', name: 'Happy User', category: 'people', icon: 'Smile', defaultSize: 60 },
  { id: 'frown', name: 'Pain Point', category: 'people', icon: 'Frown', defaultSize: 60 },
  { id: 'sparkles', name: 'Delight / Magic', category: 'symbols', icon: 'Sparkles', defaultSize: 56 },

  // Metaphors & Symbols
  { id: 'lightbulb', name: 'Idea / Insight', category: 'symbols', icon: 'Lightbulb', defaultSize: 64 },
  { id: 'target', name: 'Target / Goal', category: 'symbols', icon: 'Target', defaultSize: 64 },
  { id: 'zap', name: 'Energy / Trigger', category: 'symbols', icon: 'Zap', defaultSize: 56 },
  { id: 'shield', name: 'Trust / Shield', category: 'symbols', icon: 'Shield', defaultSize: 60 },
  { id: 'key', name: 'Key Factor', category: 'symbols', icon: 'Key', defaultSize: 56 },
  { id: 'gear', name: 'System / Engine', category: 'symbols', icon: 'Settings', defaultSize: 60 },
  { id: 'check', name: 'Validated / Yes', category: 'symbols', icon: 'CheckCircle2', defaultSize: 56 },
  { id: 'alert', name: 'Risk / Obstacle', category: 'symbols', icon: 'AlertTriangle', defaultSize: 56 },
  { id: 'flag', name: 'Milestone Flag', category: 'symbols', icon: 'Flag', defaultSize: 56 },
  { id: 'dollar', name: 'Value / Revenue', category: 'symbols', icon: 'DollarSign', defaultSize: 56 },

  // Connectors & Pointers
  { id: 'arrow-right', name: 'Process Arrow', category: 'arrows', icon: 'ArrowRight', defaultSize: 64 },
  { id: 'arrow-up-right', name: 'Growth Trend', category: 'arrows', icon: 'TrendingUp', defaultSize: 64 },
  { id: 'repeat', name: 'Loop / Cycle', category: 'arrows', icon: 'Repeat', defaultSize: 64 },
  { id: 'message-circle', name: 'Speech Bubble', category: 'frames', icon: 'MessageCircle', defaultSize: 72 },
];
