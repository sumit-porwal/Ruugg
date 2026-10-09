import type { ModelElement, SixSliceType } from '../types';

export interface SliceDefinition {
  type: SixSliceType;
  label: string;
  question: string;
  purpose: string;
  iconName: string;
  suggestedTools: string[];
  models: {
    kind: ModelElement['modelKind'];
    name: string;
    description: string;
    defaultData: any;
    defaultWidth: number;
    defaultHeight: number;
  }[];
}

export const SIX_SLICES_INFO: Record<SixSliceType, SliceDefinition> = {
  whoWhat: {
    type: 'whoWhat',
    label: '1. Who & What',
    question: 'Who are the players and what are the pieces?',
    purpose: 'Identify people, roles, objects, customers, and core entities.',
    iconName: 'Users',
    suggestedTools: ['Stick figures', 'Portrait cards', 'Entity boxes'],
    models: [
      {
        kind: 'stickmanScene',
        name: 'Stakeholder Trio',
        description: 'Visual map of 3 key roles (Customer, Team, Decision Maker)',
        defaultWidth: 500,
        defaultHeight: 280,
        defaultData: {
          characters: [
            { role: 'Customer / User', emoji: '🧑‍💻', note: 'Needs simplicity & speed', mood: 'curious' },
            { role: 'Our Team', emoji: '🤝', note: 'Building the core solution', mood: 'focused' },
            { role: 'Stakeholder', emoji: '🎯', note: 'Focused on ROI & results', mood: 'evaluating' },
          ],
        },
      },
    ],
  },
  howMuch: {
    type: 'howMuch',
    label: '2. How Much',
    question: 'How much is there? What are the quantities?',
    purpose: 'Measure, compare quantities, sizes, growth, and metrics.',
    iconName: 'BarChart2',
    suggestedTools: ['Bar Charts', 'Pie/Donut Charts', 'KPI Meters'],
    models: [
      {
        kind: 'barchart',
        name: 'Hand-drawn Bar Chart',
        description: 'Compare 4 key metrics or quarterly figures',
        defaultWidth: 480,
        defaultHeight: 300,
        defaultData: {
          yLabel: 'Growth / Impact',
          bars: [
            { label: 'Q1 Launch', value: 35, color: '#2563eb' },
            { label: 'Q2 Adoption', value: 65, color: '#059669' },
            { label: 'Q3 Scale', value: 85, color: '#d97706' },
            { label: 'Q4 Target', value: 100, color: '#dc2626' },
          ],
        },
      },
      {
        kind: 'piechart',
        name: 'Napkin Donut Chart',
        description: 'Proportion breakdown of 3 segments',
        defaultWidth: 380,
        defaultHeight: 300,
        defaultData: {
          title: 'Resource Allocation',
          slices: [
            { label: 'Product & Dev', percent: 50, color: '#2563eb' },
            { label: 'Marketing', percent: 30, color: '#059669' },
            { label: 'Ops & Support', percent: 20, color: '#d97706' },
          ],
        },
      },
    ],
  },
  where: {
    type: 'where',
    label: '3. Where',
    question: 'Where do things stand in relation to each other?',
    purpose: 'Positioning, landscapes, coordinate space, quadrants, and intersections.',
    iconName: 'Compass',
    suggestedTools: ['2x2 Matrix', 'Venn Diagram', 'Spatial Map'],
    models: [
      {
        kind: 'matrix2x2',
        name: '2x2 Strategic Matrix',
        description: 'Effort vs. Impact quadrant decision matrix',
        defaultWidth: 520,
        defaultHeight: 400,
        defaultData: {
          xAxis: 'EFFORT / COMPLEXITY →',
          yAxis: 'VALUE / IMPACT ↑',
          q1: { title: 'QUICK WINS', desc: 'High Impact, Low Effort. Do first!' },
          q2: { title: 'STRATEGIC BETS', desc: 'High Impact, High Effort. Plan carefully.' },
          q3: { title: 'FILL-INS', desc: 'Low Impact, Low Effort. Do when free.' },
          q4: { title: 'TIME SINKS', desc: 'Low Impact, High Effort. Avoid!' },
        },
      },
      {
        kind: 'venn',
        name: 'Venn Diagram',
        description: '2 overlapping concepts with intersection sweet spot',
        defaultWidth: 460,
        defaultHeight: 320,
        defaultData: {
          leftLabel: 'What Users Love',
          rightLabel: 'What Is Feasible',
          sweetSpot: 'SWEET SPOT (The Win!)',
        },
      },
    ],
  },
  when: {
    type: 'when',
    label: '4. When',
    question: 'When do things happen? In what order?',
    purpose: 'Timelines, sequences, milestones, phases, and roadmaps.',
    iconName: 'Clock',
    suggestedTools: ['Milestone Timeline', 'Linear Roadmap', 'Phases'],
    models: [
      {
        kind: 'timeline',
        name: 'Milestone Timeline',
        description: '4-phase visual roadmap with milestones',
        defaultWidth: 620,
        defaultHeight: 240,
        defaultData: {
          milestones: [
            { step: '1', title: 'Discover', time: 'Month 1', desc: 'User interviews & prototypes' },
            { step: '2', title: 'Build MVP', time: 'Month 2-3', desc: 'Core feature engine' },
            { step: '3', title: 'Beta Testing', time: 'Month 4', desc: 'Feedback loops & polish' },
            { step: '4', title: 'Full Launch', time: 'Month 5+', desc: 'Scale to market' },
          ],
        },
      },
    ],
  },
  how: {
    type: 'how',
    label: '5. How',
    question: 'How do parts interact? What is the process?',
    purpose: 'Flowcharts, operational systems, cause and effect loops.',
    iconName: 'GitFork',
    suggestedTools: ['Flowcharts', 'Input-Output Pipeline', 'Feedback Loops'],
    models: [
      {
        kind: 'flowchart',
        name: 'Process Flowchart',
        description: 'Step-by-step logic pipeline with decision node',
        defaultWidth: 620,
        defaultHeight: 280,
        defaultData: {
          nodes: [
            { id: '1', label: '1. User Problem', type: 'start' },
            { id: '2', label: '2. Sketch on Napkin', type: 'process' },
            { id: '3', label: 'Clear & Aligned?', type: 'decision' },
            { id: '4', label: '4. Execute Action', type: 'end' },
          ],
        },
      },
    ],
  },
  why: {
    type: 'why',
    label: '6. Why',
    question: 'Why does this matter? What is the underlying cause?',
    purpose: 'Trade-offs, balance scales, vision, growth curves, and core reasons.',
    iconName: 'HelpCircle',
    suggestedTools: ['Balance Scale', 'S-Curve Growth', 'Problem-Solution Bridge'],
    models: [
      {
        kind: 'balance',
        name: 'Trade-off Balance Scale',
        description: 'Weighing Cost/Risk against Opportunity/Reward',
        defaultWidth: 480,
        defaultHeight: 320,
        defaultData: {
          leftItem: 'Cost & Effort',
          leftWeight: 'Current Burden',
          rightItem: 'Future Growth',
          rightWeight: '10x Upside',
          verdict: 'Decision: Worth the investment!',
        },
      },
      {
        kind: 'scurve',
        name: 'S-Curve Growth Lifecycle',
        description: 'Visualizing learning and adoption progression',
        defaultWidth: 500,
        defaultHeight: 280,
        defaultData: {
          title: 'Adoption S-Curve',
          phases: ['Inception (Slow)', 'Hypergrowth (Steep)', 'Maturity (Plateau)'],
          inflectionPoint: 'Inflection Point: Visual Clarity',
        },
      },
    ],
  },
};

export function createModelElement(
  kind: ModelElement['modelKind'],
  category: SixSliceType,
  x: number,
  y: number,
  customColor = '#1e293b'
): ModelElement {
  const slice = SIX_SLICES_INFO[category];
  const modelDef = slice.models.find((m) => m.kind === kind) || slice.models[0];

  return {
    id: 'model_' + Math.random().toString(36).substring(2, 9),
    type: 'model',
    modelKind: kind,
    sliceCategory: category,
    title: modelDef.name,
    x,
    y,
    width: modelDef.defaultWidth,
    height: modelDef.defaultHeight,
    color: customColor,
    fillColor: '#ffffff',
    isRough: true,
    data: JSON.parse(JSON.stringify(modelDef.defaultData)),
  };
}

export function createStickyNote(
  x: number,
  y: number,
  text = 'Visual Insight!',
  tag = 'Key Takeaway',
  color = '#fef08a',
  pinColor = '#ef4444'
): ModelElement {
  return {
    id: 'sticky_' + Math.random().toString(36).substring(2, 9),
    type: 'model',
    modelKind: 'stickyNote',
    sliceCategory: 'whoWhat',
    title: 'Sticky Memo',
    x,
    y,
    width: 200,
    height: 180,
    color: '#1e293b',
    fillColor: color,
    isRough: true,
    data: {
      text,
      color,
      tag,
      pinColor,
    },
  };
}
