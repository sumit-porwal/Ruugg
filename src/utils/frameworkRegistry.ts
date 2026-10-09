import type {
  CanvasElement,
  ConnectorElement,
  FrameworkCategory,
  FrameworkId,
  GuidedStep,
  ShapeElement,
  SixSliceType,
  TextElement,
} from '../types';
import { createStickyNote } from './sixSlicesTemplates';

export interface WorkedExample {
  title: string;
  context: string;
  keyInsights: string[];
}

export interface FrameworkDefinition {
  id: FrameworkId;
  category: FrameworkCategory;
  name: string;
  tagline: string;
  purpose: string;
  bestFor: string;
  limitations: string;
  workedExample: WorkedExample;
  suggestedNextStep: string;
  iconName: string;
  sixSliceMapping: SixSliceType;
  isPrioritized?: boolean;
  guidedSteps: GuidedStep[];
  generateElements: (title?: string, problemNote?: string) => CanvasElement[];
}

export interface CognitiveCategoryInfo {
  id: FrameworkCategory;
  label: string;
  description: string;
  iconName: string;
}

export const COGNITIVE_CATEGORIES: CognitiveCategoryInfo[] = [
  {
    id: 'understand',
    label: 'A. Understand & Organize',
    description: 'Structure messy information, clarify mental models, and map interconnected concepts.',
    iconName: 'Network',
  },
  {
    id: 'analyze',
    label: 'B. Analyze Problems & Systems',
    description: 'Diagnose root causes, identify feedback loops, and distinguish symptoms from core systemic drivers.',
    iconName: 'Activity',
  },
  {
    id: 'decide',
    label: 'C. Make Decisions',
    description: 'Evaluate trade-offs, map branching decisions, test assumptions, and choose high-conviction paths.',
    iconName: 'GitBranch',
  },
  {
    id: 'plan',
    label: 'D. Plan & Execute',
    description: 'Sequence milestones, map operational workflows, spot dependencies, and turn strategy into steps.',
    iconName: 'CalendarCheck',
  },
  {
    id: 'people',
    label: 'E. Understand People & Experiences',
    description: 'Empathize with users, align diverse stakeholders, and design smooth human journeys.',
    iconName: 'Users',
  },
  {
    id: 'foundations',
    label: 'Visual Thinking Foundations',
    description: 'Dan Roam’s SQVID exploration compass, CODEX coordinate matrix, and the Six Visual Forms.',
    iconName: 'Sparkles',
  },
];

// Helper to create a connector between two elements
export function createConnector(
  fromId: string,
  toId: string,
  fromPoint: { x: number; y: number },
  toPoint: { x: number; y: number },
  label?: string,
  color = '#475569',
  lineStyle: 'solid' | 'dashed' | 'curved' = 'curved'
): ConnectorElement {
  return {
    id: 'conn_' + Math.random().toString(36).substring(2, 9),
    type: 'connector',
    fromId,
    toId,
    fromPoint,
    toPoint,
    label,
    arrowEnd: true,
    lineStyle,
    color,
    strokeWidth: 2,
    isRough: true,
  };
}

// Registry of frameworks
export const FRAMEWORKS_REGISTRY: Record<FrameworkId, FrameworkDefinition> = {
  // ==========================================
  // 1. MIND MAP (Priority 1)
  // ==========================================
  mindMap: {
    id: 'mindMap',
    category: 'understand',
    name: 'Mind Map',
    tagline: 'Radial idea expansion from a central concept',
    purpose: 'Helps brainstorm and organize thoughts outward from a core topic, preserving natural mental associations.',
    bestFor: 'Brainstorming new projects, mapping subject domains, organizing lecture notes, or unpacking an ambiguous topic.',
    limitations: 'Can become unwieldy without strict hierarchy; does not inherently capture strict chronological sequence or causal arrows.',
    isPrioritized: true,
    sixSliceMapping: 'where',
    iconName: 'Share2',
    workedExample: {
      title: 'Redesigning Customer Onboarding',
      context: 'A SaaS product team expanding all facets of their first-day user experience.',
      keyInsights: [
        'Central topic: First 10-Minute User Journey',
        'Branch 1: Frictionless Auth (Single sign-on, email verification)',
        'Branch 2: Value Aha-Moment (Interactive tutorial vs sample project)',
        'Branch 3: Retention Hooks (Helpful welcome email, proactive tooltips)',
      ],
    },
    suggestedNextStep: 'Convert key branches into a Question Tree or a Prioritized Milestone Timeline.',
    guidedSteps: [
      {
        id: 'center',
        question: 'What is the central topic or challenge you want to explore?',
        hint: 'Use 2–5 words that capture the focal anchor of your thinking.',
        fieldKey: 'centerTopic',
        placeholder: 'e.g. Next-Gen Mobile App Strategy',
        suggestedSemanticTag: 'hypothesis',
      },
      {
        id: 'branch1',
        question: 'What is the first major dimension or theme of this topic?',
        hint: 'Think of broad categories like User Experience, Tech Stack, or Market Positioning.',
        fieldKey: 'theme1',
        placeholder: 'e.g. User Experience & Flow',
        suggestedSemanticTag: 'fact',
      },
      {
        id: 'branch2',
        question: 'What is another distinct dimension to consider?',
        hint: 'Consider contrasting technical, operational, or customer angles.',
        fieldKey: 'theme2',
        placeholder: 'e.g. Technical Feasibility',
        suggestedSemanticTag: 'assumption',
      },
      {
        id: 'branch3',
        question: 'What is a third dimension or critical unknown?',
        hint: 'Highlight areas of risk, distribution, or resource constraints.',
        fieldKey: 'theme3',
        placeholder: 'e.g. Business Viability & Reach',
        suggestedSemanticTag: 'question',
      },
    ],
    generateElements: (title = 'Core Topic', note = 'Central focus') => {
      const centerId = 'node_center';
      const b1Id = 'node_b1';
      const b2Id = 'node_b2';
      const b3Id = 'node_b3';
      const b4Id = 'node_b4';

      return [
        {
          id: centerId,
          type: 'shape',
          shapeType: 'circle',
          x: 420,
          y: 260,
          width: 170,
          height: 110,
          color: '#1e3a8a',
          fillColor: '#dbeafe',
          strokeWidth: 3,
          isRough: true,
          text: title,
          fontSize: 18,
          tag: 'hypothesis',
        } as ShapeElement,
        {
          id: b1Id,
          type: 'shape',
          shapeType: 'rect',
          x: 160,
          y: 120,
          width: 150,
          height: 70,
          color: '#065f46',
          fillColor: '#d1fae5',
          strokeWidth: 2,
          isRough: true,
          text: 'Branch 1: Core Needs',
          fontSize: 14,
          tag: 'fact',
        } as ShapeElement,
        {
          id: b2Id,
          type: 'shape',
          shapeType: 'rect',
          x: 680,
          y: 120,
          width: 150,
          height: 70,
          color: '#854d0e',
          fillColor: '#fef3c7',
          strokeWidth: 2,
          isRough: true,
          text: 'Branch 2: Opportunities',
          fontSize: 14,
          tag: 'assumption',
        } as ShapeElement,
        {
          id: b3Id,
          type: 'shape',
          shapeType: 'rect',
          x: 160,
          y: 400,
          width: 150,
          height: 70,
          color: '#1e40af',
          fillColor: '#e0e7ff',
          strokeWidth: 2,
          isRough: true,
          text: 'Branch 3: Constraints',
          fontSize: 14,
          tag: 'question',
        } as ShapeElement,
        {
          id: b4Id,
          type: 'shape',
          shapeType: 'rect',
          x: 680,
          y: 400,
          width: 150,
          height: 70,
          color: '#9f1239',
          fillColor: '#ffe4e6',
          strokeWidth: 2,
          isRough: true,
          text: 'Branch 4: Next Bets',
          fontSize: 14,
          tag: 'action',
        } as ShapeElement,
        createConnector(centerId, b1Id, { x: 440, y: 270 }, { x: 290, y: 180 }, 'Informs'),
        createConnector(centerId, b2Id, { x: 570, y: 270 }, { x: 690, y: 180 }, 'Drives'),
        createConnector(centerId, b3Id, { x: 440, y: 350 }, { x: 290, y: 410 }, 'Constrains'),
        createConnector(centerId, b4Id, { x: 570, y: 350 }, { x: 690, y: 410 }, 'Leads to'),
        createStickyNote(420, 420, note || 'Tip: Add sub-branches or label assumptions to verify!', 'Tip', '#fef9c3'),
      ];
    },
  },

  // ==========================================
  // 2. QUESTION TREE (Priority 2)
  // ==========================================
  questionTree: {
    id: 'questionTree',
    category: 'understand',
    name: 'Question Tree',
    tagline: 'Deconstruct complex questions into answerable sub-inquiries',
    purpose: 'Breaks high-level ambiguous dilemmas into mutually exclusive, collectively exhaustive (MECE) sub-questions.',
    bestFor: 'Strategy development, research inquiries, diagnostic investigation, and clarifying fuzzy briefs.',
    limitations: 'Requires disciplined phrasing—statements must be questions, not pre-mature conclusions.',
    isPrioritized: true,
    sixSliceMapping: 'why',
    iconName: 'HelpCircle',
    workedExample: {
      title: 'Should We Expand into Enterprise Sales?',
      context: 'Leadership evaluating whether to transition a product-led SaaS business to enterprise contracts.',
      keyInsights: [
        'Root Question: Will enterprise expansion generate sustainable profit without starving SMB growth?',
        'Sub-Question 1: Is there proven demand from >500 employee teams?',
        'Sub-Question 2: Do we have the security/SOC2 compliance capabilities?',
        'Sub-Question 3: Will the unit economics cover high-touch enterprise sales reps?',
      ],
    },
    suggestedNextStep: 'Label each leaf question as Fact (Answered), Assumption, or Evidence Needed, then turn into tests.',
    guidedSteps: [
      {
        id: 'mainQ',
        question: 'What is the primary overarching question you must answer?',
        hint: 'Start with "How can we...", "Why does...", or "Should we..."',
        fieldKey: 'primaryQuestion',
        placeholder: 'e.g. How can we reduce user churn by 25% this quarter?',
        suggestedSemanticTag: 'question',
      },
      {
        id: 'subQ1',
        question: 'What is the first critical sub-question that must be answered first?',
        hint: 'Focus on demand, user behavior, or technical feasibility.',
        fieldKey: 'subQuestion1',
        placeholder: 'e.g. Why are users dropping off during week 2?',
        suggestedSemanticTag: 'question',
      },
      {
        id: 'subQ2',
        question: 'What is the second critical sub-question?',
        hint: 'Focus on alternatives, price elasticity, or operational bottlenecks.',
        fieldKey: 'subQuestion2',
        placeholder: 'e.g. Are competitors offering better alternatives?',
        suggestedSemanticTag: 'hypothesis',
      },
      {
        id: 'subQ3',
        question: 'What is the third sub-question?',
        hint: 'Focus on resource cost or team bandwidth.',
        fieldKey: 'subQuestion3',
        placeholder: 'e.g. Do we have the bandwidth to build the requested integrations?',
        suggestedSemanticTag: 'evidence_needed',
      },
    ],
    generateElements: (title = 'Primary Question?', note = 'Deconstruct unknowns') => {
      const rootId = 'qtree_root';
      const q1Id = 'qtree_q1';
      const q2Id = 'qtree_q2';
      const q3Id = 'qtree_q3';
      const leaf1 = 'qtree_leaf1';
      const leaf2 = 'qtree_leaf2';

      return [
        {
          id: rootId,
          type: 'shape',
          shapeType: 'rect',
          x: 60,
          y: 240,
          width: 220,
          height: 90,
          color: '#1d4ed8',
          fillColor: '#eff6ff',
          strokeWidth: 3,
          isRough: true,
          text: title,
          fontSize: 16,
          tag: 'question',
        } as ShapeElement,
        {
          id: q1Id,
          type: 'shape',
          shapeType: 'rect',
          x: 360,
          y: 100,
          width: 210,
          height: 75,
          color: '#0369a1',
          fillColor: '#f0f9ff',
          strokeWidth: 2,
          isRough: true,
          text: '1. Is there real demand?',
          fontSize: 14,
          tag: 'question',
        } as ShapeElement,
        {
          id: q2Id,
          type: 'shape',
          shapeType: 'rect',
          x: 360,
          y: 250,
          width: 210,
          height: 75,
          color: '#7c3aed',
          fillColor: '#f5f3ff',
          strokeWidth: 2,
          isRough: true,
          text: '2. Is it technically viable?',
          fontSize: 14,
          tag: 'hypothesis',
        } as ShapeElement,
        {
          id: q3Id,
          type: 'shape',
          shapeType: 'rect',
          x: 360,
          y: 400,
          width: 210,
          height: 75,
          color: '#be123c',
          fillColor: '#fff1f2',
          strokeWidth: 2,
          isRough: true,
          text: '3. Are unit economics sound?',
          fontSize: 14,
          tag: 'evidence_needed',
        } as ShapeElement,
        {
          id: leaf1,
          type: 'shape',
          shapeType: 'rect',
          x: 650,
          y: 80,
          width: 190,
          height: 60,
          color: '#059669',
          fillColor: '#ecfdf5',
          strokeWidth: 2,
          isRough: true,
          text: 'User interviews (n=20)',
          fontSize: 13,
          tag: 'fact',
        } as ShapeElement,
        {
          id: leaf2,
          type: 'shape',
          shapeType: 'rect',
          x: 650,
          y: 160,
          width: 190,
          height: 60,
          color: '#d97706',
          fillColor: '#fffbeb',
          strokeWidth: 2,
          isRough: true,
          text: 'Search volume data',
          fontSize: 13,
          tag: 'assumption',
        } as ShapeElement,
        createConnector(rootId, q1Id, { x: 280, y: 260 }, { x: 360, y: 140 }),
        createConnector(rootId, q2Id, { x: 280, y: 285 }, { x: 360, y: 285 }),
        createConnector(rootId, q3Id, { x: 280, y: 310 }, { x: 360, y: 430 }),
        createConnector(q1Id, leaf1, { x: 570, y: 120 }, { x: 650, y: 110 }),
        createConnector(q1Id, leaf2, { x: 570, y: 150 }, { x: 650, y: 190 }),
        createStickyNote(650, 270, note || 'Principle: MECE (Mutually Exclusive, Collectively Exhaustive)', 'Rule', '#fef08a'),
      ];
    },
  },

  // ==========================================
  // 3. CAUSE-AND-EFFECT / FISHBONE (Priority 3)
  // ==========================================
  causeEffect: {
    id: 'causeEffect',
    category: 'analyze',
    name: 'Cause-and-Effect Map (Fishbone)',
    tagline: 'Systematic root cause analysis across major contributing categories',
    purpose: 'Helps identify, explore, and display all possible causes related to a problem or condition to discover root causes.',
    bestFor: 'Investigating production defects, system outages, conversion drop-offs, or recurring operational failures.',
    limitations: 'Can oversimplify non-linear feedback loops; do not assume a listed cause is a proven root cause without evidence.',
    isPrioritized: true,
    sixSliceMapping: 'how',
    iconName: 'GitCommit',
    workedExample: {
      title: 'High Server Latency During Morning Peak',
      context: 'Engineering team debugging why the core database spikes to 100% CPU at 9:00 AM.',
      keyInsights: [
        'Observed Effect: P99 latency jumps from 120ms to 4200ms at 9am',
        'Category: Software (Uncached search query loops in dashboard)',
        'Category: Process (Scheduled batch report runs simultaneously)',
        'Category: People (Customer support running un-indexed bulk exports)',
        'Root Intervention: Move batch reports to off-peak and index search cache',
      ],
    },
    suggestedNextStep: 'Tag suspect causes as Hypothesis or Evidence Needed, run targeted diagnostics, and log proven Facts.',
    guidedSteps: [
      {
        id: 'effect',
        question: 'What is the specific observed problem or symptom?',
        hint: 'Describe the measurable symptom clearly without guessing causes yet.',
        fieldKey: 'observedEffect',
        placeholder: 'e.g. Customer churn increased by 14% last month',
        suggestedSemanticTag: 'fact',
      },
      {
        id: 'cat1',
        question: 'What factors in People or Behavior might contribute?',
        hint: 'Team habits, training, customer behavior, communication gaps.',
        fieldKey: 'peopleCauses',
        placeholder: 'e.g. Sales over-promising unbuilt features',
        suggestedSemanticTag: 'hypothesis',
      },
      {
        id: 'cat2',
        question: 'What factors in Process or Systems might contribute?',
        hint: 'Workflows, handoffs, automated triggers, release cycles.',
        fieldKey: 'processCauses',
        placeholder: 'e.g. No onboarding follow-up call after signup',
        suggestedSemanticTag: 'assumption',
      },
      {
        id: 'cat3',
        question: 'What factors in Tools or Environment might contribute?',
        hint: 'Software bugs, technical debt, platform stability, market shifts.',
        fieldKey: 'toolsCauses',
        placeholder: 'e.g. Slow dashboard load time causes user frustration',
        suggestedSemanticTag: 'evidence_needed',
      },
      {
        id: 'intervention',
        question: 'What is the highest-leverage intervention point to test first?',
        hint: 'Choose a fast, reversible experiment before heavy refactoring.',
        fieldKey: 'firstIntervention',
        placeholder: 'e.g. Test an automated onboarding checklist prompt',
        suggestedSemanticTag: 'action',
      },
    ],
    generateElements: (title = 'Observed Problem', note = 'Investigate causes') => {
      const effectId = 'ce_effect';
      const catPeople = 'ce_people';
      const catProcess = 'ce_process';
      const catTech = 'ce_tech';
      const catEnv = 'ce_env';

      return [
        // Main spine arrow
        {
          id: 'ce_spine',
          type: 'shape',
          shapeType: 'arrow',
          x: 100,
          y: 280,
          width: 580,
          height: 18,
          color: '#334155',
          strokeWidth: 4,
          isRough: true,
        } as ShapeElement,
        // The Head (Observed Effect)
        {
          id: effectId,
          type: 'shape',
          shapeType: 'rect',
          x: 690,
          y: 235,
          width: 200,
          height: 95,
          color: '#be123c',
          fillColor: '#ffe4e6',
          strokeWidth: 3,
          isRough: true,
          text: `PROBLEM:\n${title}`,
          fontSize: 16,
          tag: 'fact',
          evidenceNotes: 'Observed and recorded metric anomaly',
        } as ShapeElement,
        // Category 1: People
        {
          id: catPeople,
          type: 'shape',
          shapeType: 'rect',
          x: 180,
          y: 90,
          width: 170,
          height: 65,
          color: '#1e40af',
          fillColor: '#eff6ff',
          strokeWidth: 2,
          isRough: true,
          text: '1. People & Roles',
          fontSize: 14,
          tag: 'hypothesis',
        } as ShapeElement,
        createConnector(catPeople, effectId, { x: 265, y: 155 }, { x: 360, y: 280 }, '', '#1e40af', 'solid'),
        // Cause under people
        createStickyNote(140, 170, 'Unclear handoff between sales & support', 'Suspected Cause', '#fef9c3'),
        // Category 2: Process
        {
          id: catProcess,
          type: 'shape',
          shapeType: 'rect',
          x: 440,
          y: 90,
          width: 170,
          height: 65,
          color: '#065f46',
          fillColor: '#ecfdf5',
          strokeWidth: 2,
          isRough: true,
          text: '2. Process & Steps',
          fontSize: 14,
          tag: 'assumption',
        } as ShapeElement,
        createConnector(catProcess, effectId, { x: 525, y: 155 }, { x: 570, y: 280 }, '', '#065f46', 'solid'),
        // Category 3: Technology
        {
          id: catTech,
          type: 'shape',
          shapeType: 'rect',
          x: 180,
          y: 390,
          width: 170,
          height: 65,
          color: '#7c3aed',
          fillColor: '#f5f3ff',
          strokeWidth: 2,
          isRough: true,
          text: '3. Tech & Tools',
          fontSize: 14,
          tag: 'evidence_needed',
        } as ShapeElement,
        createConnector(catTech, effectId, { x: 265, y: 390 }, { x: 360, y: 300 }, '', '#7c3aed', 'solid'),
        // Category 4: Environment
        {
          id: catEnv,
          type: 'shape',
          shapeType: 'rect',
          x: 440,
          y: 390,
          width: 170,
          height: 65,
          color: '#c2410c',
          fillColor: '#fff7ed',
          strokeWidth: 2,
          isRough: true,
          text: '4. External Drivers',
          fontSize: 14,
          tag: 'assumption',
        } as ShapeElement,
        createConnector(catEnv, effectId, { x: 525, y: 390 }, { x: 570, y: 300 }, '', '#c2410c', 'solid'),
        // Intervention sticky
        {
          id: 'action_next',
          type: 'shape',
          shapeType: 'bubble',
          x: 690,
          y: 380,
          width: 200,
          height: 90,
          color: '#059669',
          fillColor: '#d1fae5',
          strokeWidth: 2,
          isRough: true,
          text: 'NEXT TEST:\nRun diagnostic audit',
          fontSize: 14,
          tag: 'action',
        } as ShapeElement,
        createStickyNote(690, 80, note || 'Tip: Label suspected causes as Hypothesis or Evidence Needed.', 'Diagnostic Note', '#fef9c3'),
      ];
    },
  },

  // ==========================================
  // 4. DECISION MAP / DECISION TREE (Priority 4)
  // ==========================================
  decisionTree: {
    id: 'decisionTree',
    category: 'decide',
    name: 'Decision Map & Tree',
    tagline: 'Compare branching options, trade-offs, and conviction levels',
    purpose: 'Clarifies strategic crossroads by laying out mutually exclusive choices, criteria, trade-offs, and critical assumptions.',
    bestFor: 'Choosing between architectural paths, vendor selection, go-to-market trade-offs, or funding allocations.',
    limitations: 'Subjective weightings are not objective truths; always explicitly record assumptions that could alter the decision.',
    isPrioritized: true,
    sixSliceMapping: 'why',
    iconName: 'GitMerge',
    workedExample: {
      title: 'Build vs Buy Auth Infrastructure',
      context: 'Product leadership deciding whether to integrate third-party Auth0/Clerk or maintain in-house authentication.',
      keyInsights: [
        'Objective: Launch in 4 weeks with SOC2 compliance at minimal ongoing maintenance.',
        'Option A (Buy SaaS): Fast time-to-market, compliant, $0.05/MAU recurring cost.',
        'Option B (Build Custom): Complete data sovereignty, 12 engineering weeks to build.',
        'Critical Assumption: If MAU exceeds 1M, enterprise custom negotiation is cheaper than build.',
        'Selected Decision: Buy SaaS for MVP, re-evaluate at 250k MAU.',
      ],
    },
    suggestedNextStep: 'Explicitly mark the decision with criteria, confidence score, and trigger condition for re-evaluation.',
    guidedSteps: [
      {
        id: 'goal',
        question: 'What core choice or fork in the road are you facing?',
        hint: 'State the decision objective clearly in one concise sentence.',
        fieldKey: 'decisionObjective',
        placeholder: 'e.g. Choose database for real-time multiplayer sync',
        suggestedSemanticTag: 'decision',
      },
      {
        id: 'optA',
        question: 'What is Alternative A, and its biggest advantage?',
        hint: 'Highlight what makes this option compelling.',
        fieldKey: 'optionA',
        placeholder: 'e.g. PostgreSQL with WebSockets (Familiar & battle-tested)',
        suggestedSemanticTag: 'hypothesis',
      },
      {
        id: 'optB',
        question: 'What is Alternative B, and its biggest advantage?',
        hint: 'Highlight the counter-approach.',
        fieldKey: 'optionB',
        placeholder: 'e.g. Cloudflare Durable Objects (Zero-ops edge sync)',
        suggestedSemanticTag: 'hypothesis',
      },
      {
        id: 'criteria',
        question: 'What is the deciding criterion or trade-off that tips the scale?',
        hint: 'Is it speed to ship, engineering cost, latency, or compliance?',
        fieldKey: 'primaryCriterion',
        placeholder: 'e.g. Speed to ship within 2 weeks is #1 priority',
        suggestedSemanticTag: 'fact',
      },
      {
        id: 'riskAssumption',
        question: 'What assumption, if proven false, would reverse this choice?',
        hint: 'Document the vulnerability or test that could invalidate this path.',
        fieldKey: 'killerAssumption',
        placeholder: 'e.g. Assumes developer pricing stays under $100/mo',
        suggestedSemanticTag: 'assumption',
      },
    ],
    generateElements: (title = 'Strategic Decision', note = 'Evaluate alternatives') => {
      const decisionRoot = 'dec_root';
      const optA = 'dec_optA';
      const optB = 'dec_optB';
      const verdict = 'dec_verdict';

      return [
        createStickyNote(80, 60, note || 'Tip: Record what assumption would reverse this verdict.', 'Criteria', '#fef9c3'),
        {
          id: decisionRoot,
          type: 'shape',
          shapeType: 'diamond',
          x: 80,
          y: 220,
          width: 190,
          height: 130,
          color: '#1d4ed8',
          fillColor: '#eff6ff',
          strokeWidth: 3,
          isRough: true,
          text: title,
          fontSize: 15,
          tag: 'decision',
        } as ShapeElement,
        // Option A Branch
        {
          id: optA,
          type: 'shape',
          shapeType: 'rect',
          x: 360,
          y: 110,
          width: 220,
          height: 80,
          color: '#047857',
          fillColor: '#ecfdf5',
          strokeWidth: 2,
          isRough: true,
          text: 'Option A: Buy / Integrate\nFast speed to market',
          fontSize: 14,
          tag: 'hypothesis',
        } as ShapeElement,
        createConnector(decisionRoot, optA, { x: 270, y: 250 }, { x: 360, y: 150 }, 'Path 1'),
        createStickyNote(620, 90, 'Pros: Launch in 1 week\nCons: $0.05/MAU cost', 'Trade-offs A', '#d1fae5'),
        // Option B Branch
        {
          id: optB,
          type: 'shape',
          shapeType: 'rect',
          x: 360,
          y: 350,
          width: 220,
          height: 80,
          color: '#b45309',
          fillColor: '#fffbeb',
          strokeWidth: 2,
          isRough: true,
          text: 'Option B: Build Custom\nFull control & zero fees',
          fontSize: 14,
          tag: 'hypothesis',
        } as ShapeElement,
        createConnector(decisionRoot, optB, { x: 270, y: 310 }, { x: 360, y: 390 }, 'Path 2'),
        createStickyNote(620, 330, 'Pros: No SaaS fees\nCons: 8 engineering weeks', 'Trade-offs B', '#fef3c7'),
        // Verdict Card
        {
          id: verdict,
          type: 'shape',
          shapeType: 'rect',
          x: 360,
          y: 235,
          width: 260,
          height: 85,
          color: '#2563eb',
          fillColor: '#dbeafe',
          strokeWidth: 2,
          isRough: true,
          text: 'RECOMMENDED VERDICT:\nOption A for MVP; re-evaluate at 250k MAU',
          fontSize: 13,
          tag: 'decision',
        } as ShapeElement,
        createConnector(optA, verdict, { x: 470, y: 190 }, { x: 470, y: 235 }, 'Selected', '#2563eb'),
      ];
    },
  },

  // ==========================================
  // 5. WORKFLOW / TIMELINE (Priority 5)
  // ==========================================
  workflow: {
    id: 'workflow',
    category: 'plan',
    name: 'Workflow & Process Pipeline',
    tagline: 'Map operational phases, decision gates, and task handoffs',
    purpose: 'Visualizes sequential actions, automated transitions, approval checkpoints, and operational handoffs.',
    bestFor: 'Designing product user flows, delivery pipelines, customer support triage, or operational SOPs.',
    limitations: 'Can obscure asynchronous parallel work streams if drawn purely as a strict single linear chain.',
    isPrioritized: true,
    sixSliceMapping: 'how',
    iconName: 'GitPullRequest',
    workedExample: {
      title: 'Bug Report to Production Hotfix',
      context: 'DevOps team mapping their incident response workflow from user alert to hotfix deployment.',
      keyInsights: [
        'Step 1: Automated Sentry Alert arrives in Slack #incidents',
        'Step 2: On-call engineer triages severity (P0 vs P2)',
        'Decision Node: Is customer data impacted? (If YES -> Trigger status page)',
        'Step 3: Reproduce bug in staging sandbox',
        'Step 4: Ship hotfix via CI/CD canary deployment',
      ],
    },
    suggestedNextStep: 'Convert key steps into assigned Action items with owners, criteria, and estimated timeframes.',
    guidedSteps: [
      {
        id: 'trigger',
        question: 'What event or input triggers this workflow to start?',
        hint: 'User action, scheduled cron, inbound webhook, or customer ticket.',
        fieldKey: 'workflowTrigger',
        placeholder: 'e.g. User clicks "Upgrade to Pro"',
        suggestedSemanticTag: 'fact',
      },
      {
        id: 'step1',
        question: 'What is the immediate first action taken?',
        hint: 'Data validation, system dispatch, or notification.',
        fieldKey: 'action1',
        placeholder: 'e.g. System verifies billing info & creates stripe checkout',
        suggestedSemanticTag: 'action',
      },
      {
        id: 'checkpoint',
        question: 'Where is the key decision gate or verification check?',
        hint: 'What condition splits the path into Success vs Failure?',
        fieldKey: 'decisionCheck',
        placeholder: 'e.g. Payment authorized successfully?',
        suggestedSemanticTag: 'decision',
      },
      {
        id: 'outcome',
        question: 'What is the ideal completion state or deliverables?',
        hint: 'Account upgraded, welcome email dispatched, receipt generated.',
        fieldKey: 'targetOutcome',
        placeholder: 'e.g. User unlocked immediately and greeted with confirmation',
        suggestedSemanticTag: 'action',
      },
    ],
    generateElements: (title = 'Operational Workflow', note = 'Process stages') => {
      const step1 = 'wf_step1';
      const step2 = 'wf_step2';
      const gate = 'wf_gate';
      const step3 = 'wf_step3';
      const failStep = 'wf_fail';

      return [
        {
          id: 'title_wf',
          type: 'text',
          x: 60,
          y: 60,
          text: `Workflow: ${title}`,
          fontSize: 26,
          color: '#0f172a',
          fontFamily: 'Kalam',
        } as TextElement,
        // Step 1
        {
          id: step1,
          type: 'shape',
          shapeType: 'rect',
          x: 60,
          y: 180,
          width: 170,
          height: 85,
          color: '#047857',
          fillColor: '#ecfdf5',
          strokeWidth: 2,
          isRough: true,
          text: '1. Inbound Trigger\n(User / Signal)',
          fontSize: 14,
          tag: 'fact',
        } as ShapeElement,
        // Step 2
        {
          id: step2,
          type: 'shape',
          shapeType: 'rect',
          x: 290,
          y: 180,
          width: 170,
          height: 85,
          color: '#1d4ed8',
          fillColor: '#eff6ff',
          strokeWidth: 2,
          isRough: true,
          text: '2. Process & Triage\n(Analyze context)',
          fontSize: 14,
          tag: 'action',
        } as ShapeElement,
        createConnector(step1, step2, { x: 230, y: 222 }, { x: 290, y: 222 }),
        // Decision Gate
        {
          id: gate,
          type: 'shape',
          shapeType: 'diamond',
          x: 520,
          y: 155,
          width: 150,
          height: 135,
          color: '#b45309',
          fillColor: '#fef3c7',
          strokeWidth: 2,
          isRough: true,
          text: 'Validation\nPassed?',
          fontSize: 13,
          tag: 'decision',
        } as ShapeElement,
        createConnector(step2, gate, { x: 460, y: 222 }, { x: 520, y: 222 }),
        // Step 3 (Success)
        {
          id: step3,
          type: 'shape',
          shapeType: 'rect',
          x: 740,
          y: 180,
          width: 180,
          height: 85,
          color: '#059669',
          fillColor: '#d1fae5',
          strokeWidth: 3,
          isRough: true,
          text: '3. Deliver & Complete\n(Success state)',
          fontSize: 14,
          tag: 'action',
        } as ShapeElement,
        createConnector(gate, step3, { x: 670, y: 222 }, { x: 740, y: 222 }, 'Yes'),
        // Fail branch
        {
          id: failStep,
          type: 'shape',
          shapeType: 'rect',
          x: 510,
          y: 350,
          width: 170,
          height: 75,
          color: '#be123c',
          fillColor: '#ffe4e6',
          strokeWidth: 2,
          isRough: true,
          text: 'Exception Fallback\nNotify owner',
          fontSize: 13,
          tag: 'action',
        } as ShapeElement,
        createConnector(gate, failStep, { x: 595, y: 290 }, { x: 595, y: 350 }, 'No'),
        createStickyNote(60, 330, note || 'Tip: Label responsibilities and SLA targets on each handoff.', 'SLA Target', '#fef9c3'),
      ];
    },
  },

  // ==========================================
  // 6. SQVID EXPLORATION (Priority 6)
  // ==========================================
  sqvid: {
    id: 'sqvid',
    category: 'foundations',
    name: 'SQVID Visual Exploration Studio',
    tagline: 'Dan Roam’s 5-dimension brainstorming compass for idea representation',
    purpose: 'Helps systematically generate alternative visual angles of the exact same idea along 5 fundamental perceptual spectrums.',
    bestFor: 'Overcoming creative block, tailoring presentations for executive vs engineer audiences, and discovering unseen facets of an idea.',
    limitations: 'Focuses on visual communication choices rather than proving data validity.',
    isPrioritized: true,
    sixSliceMapping: 'where',
    iconName: 'Compass',
    workedExample: {
      title: 'Pitching a New AI Feature to Leadership vs Engineers',
      context: 'Product manager testing how to visually articulate an AI assistant across different stakeholder contexts.',
      keyInsights: [
        'S: Simple (Stick figure user + magic wand) vs Elaborate (Multi-tier architecture diagram)',
        'Q: Qualitative (Customer smile & emotional relief) vs Quantitative (42% hours saved per week)',
        'V: Vision (Day in the life in 2030) vs Execution (Sprint 1 roadmap milestones)',
        'I: Individual (Single user persona experience) vs Comparison (Our app vs Legacy competitor)',
        'D: Delta (Before/After transformation) vs Status Quo (Continuity of existing workflow)',
      ],
    },
    suggestedNextStep: 'Pick the 2 most compelling visual dimensions and generate dedicated canvas slides to present side-by-side.',
    guidedSteps: [
      {
        id: 'idea',
        question: 'What core concept or pitch do you want to explore visually?',
        hint: 'State your product, proposal, or insight.',
        fieldKey: 'coreIdea',
        placeholder: 'e.g. Automated real-time translation for global customer support',
        suggestedSemanticTag: 'hypothesis',
      },
      {
        id: 'sqvid_s',
        question: 'Simple vs. Detailed: What is the single simplest 5-second sketch?',
        hint: 'If you only had 1 index card and 10 seconds to draw it.',
        fieldKey: 'simpleView',
        placeholder: 'e.g. Two people speaking different languages with an instant translation speech bubble',
        suggestedSemanticTag: 'fact',
      },
      {
        id: 'sqvid_q',
        question: 'Qualitative vs. Quantitative: What numbers or emotional feel best represent it?',
        hint: 'Contrast emotional relief with hard conversion/retention percentages.',
        fieldKey: 'quantView',
        placeholder: 'e.g. 85% first-response resolution vs happy customer emojis',
        suggestedSemanticTag: 'assumption',
      },
      {
        id: 'sqvid_v',
        question: 'Vision vs. Execution: Where does this lead in 3 years vs next Tuesday?',
        hint: 'Long-term inspirational dream vs immediate tactical first step.',
        fieldKey: 'visionView',
        placeholder: 'e.g. Vision: Global frictionless support; Execution: Chrome extension prototype',
        suggestedSemanticTag: 'action',
      },
    ],
    generateElements: (title = 'Idea Exploration', note = 'SQVID 5 Levers') => {
      return [
        {
          id: 'sqvid_header',
          type: 'text',
          x: 60,
          y: 40,
          text: `SQVID Exploration: ${title}`,
          fontSize: 26,
          color: '#0f172a',
          fontFamily: 'Kalam',
        } as TextElement,
        // Dimension S
        createStickyNote(60, 110, 'S: Simple vs Detailed\n• Simple: 1-line napkin sketch\n• Detailed: Architectural schematic', 'S: Simple / Detailed', '#dbeafe', '#2563eb'),
        // Dimension Q
        createStickyNote(290, 110, 'Q: Qualitative vs Quantitative\n• Quality: User delight & empathy\n• Quantity: Bar chart & ROI metric', 'Q: Qual / Quant', '#d1fae5', '#059669'),
        // Dimension V
        createStickyNote(520, 110, 'V: Vision vs Reality\n• Vision: Where we want to be\n• Reality: Current hurdles today', 'V: Vision / Reality', '#fef3c7', '#d97706'),
        // Dimension I
        createStickyNote(60, 310, 'I: Individual vs Comparison\n• Individual: Deep dive on 1 hero\n• Comparison: Side-by-side shootout', 'I: Self / Compare', '#e0e7ff', '#4f46e5'),
        // Dimension D
        createStickyNote(290, 310, 'D: Delta vs Status Quo\n• Delta: Before vs After change\n• Similarities: Consistent anchors', 'D: Delta / Change', '#ffe4e6', '#e11d48'),
        createStickyNote(520, 310, note || 'Tip: Move through all 5 levers to uncover unexpected angles.', 'SQVID Note', '#fef9c3'),
        // Center insight stamp
        {
          id: 'sqvid_stamp',
          type: 'stamp',
          stampIcon: 'compass',
          x: 740,
          y: 330,
          size: 72,
          color: '#2563eb',
          label: 'SQVID Compass',
        },
      ];
    },
  },

  // ==========================================
  // CODEX COORDINATION SYSTEM
  // ==========================================
  codex: {
    id: 'codex',
    category: 'foundations',
    name: 'CODEX Coordination Matrix',
    tagline: 'Dan Roam’s visual thinking matrix: matching question to visual form',
    purpose: 'Maps the Six Ways of Seeing (Who, How Much, Where, When, How, Why) to appropriate visual models based on your communication goals.',
    bestFor: 'Selecting the perfect diagram type before drawing; teaching visual literacy across multidisciplinary teams.',
    limitations: 'A guide, not a rigid prison—creative diagrams often combine elements of multiple slices.',
    sixSliceMapping: 'where',
    iconName: 'LayoutGrid',
    workedExample: {
      title: 'Choosing Diagrams for an Investor Pitch Deck',
      context: 'Startup founder organizing the 6 slides for a 5-minute investor presentation.',
      keyInsights: [
        'Slide 1 (Who/What): Team portraits & user avatar',
        'Slide 2 (How Much): Market size TAM bar chart',
        'Slide 3 (Where): Competitor 2x2 matrix positioning',
        'Slide 4 (When): Product milestone roadmap timeline',
        'Slide 5 (How): Core proprietary tech pipeline flowchart',
        'Slide 6 (Why): Unit economics trade-off balance scale',
      ],
    },
    suggestedNextStep: 'Select whichever slice best answers your immediate blocker and generate a dedicated canvas slide.',
    guidedSteps: [
      {
        id: 'coreQ',
        question: 'Which of the 6 fundamental visual questions matters most right now?',
        hint: 'Who/What, How Much, Where, When, How, or Why?',
        fieldKey: 'selectedSlice',
        placeholder: 'e.g. How (Process) and Why (Trade-offs)',
        suggestedSemanticTag: 'question',
      },
    ],
    generateElements: (title = 'CODEX Visual Matrix') => {
      return [
        {
          id: 'codex_head',
          type: 'text',
          x: 60,
          y: 50,
          text: title ? `Dan Roam's CODEX: ${title}` : 'Dan Roam\'s CODEX: The 6 Ways of Seeing',
          fontSize: 28,
          color: '#0f172a',
          fontFamily: 'Kalam',
        } as TextElement,
        createStickyNote(60, 120, '1. WHO & WHAT:\nPortraits, avatars, stick figures, and objects.', 'Who / What', '#eff6ff', '#1d4ed8'),
        createStickyNote(280, 120, '2. HOW MUCH:\nBar charts, pie charts, metric meters, and volumes.', 'How Much', '#ecfdf5', '#047857'),
        createStickyNote(500, 120, '3. WHERE:\n2x2 Strategic Matrix, Venn diagrams, spatial maps.', 'Where', '#fef3c7', '#b45309'),
        createStickyNote(60, 310, '4. WHEN:\nTimelines, milestone paths, Gantt roadmaps, phases.', 'When', '#f5f3ff', '#7c3aed'),
        createStickyNote(280, 310, '5. HOW:\nFlowcharts, state machines, operational loops.', 'How', '#fff1f2', '#be123c'),
        createStickyNote(500, 310, '6. WHY:\nBalance scales, S-curves, equations, vision bridges.', 'Why', '#f0fdf4', '#15803d'),
      ];
    },
  },

  // ==========================================
  // ADDITIONAL FRAMEWORKS (Cleanly implemented for template expansion)
  // ==========================================
  conceptMap: {
    id: 'conceptMap',
    category: 'understand',
    name: 'Concept Map',
    tagline: 'Network of concepts connected by labeled propositions',
    purpose: 'Clarifies domain ontology and relationships with explicit verbs linking nodes.',
    bestFor: 'Mapping complex domains, knowledge engineering, curriculum design.',
    limitations: 'Can become dense if relationship labels are too wordy.',
    sixSliceMapping: 'where',
    iconName: 'Network',
    workedExample: {
      title: 'Neural Network Fundamentals',
      context: 'Educator explaining how layers, weights, and loss functions interconnect.',
      keyInsights: ['Inputs connect to Hidden Layers via Weights', 'Loss Function evaluates Error against Ground Truth'],
    },
    suggestedNextStep: 'Trace key dependency paths to verify logic.',
    guidedSteps: [],
    generateElements: (title = 'Concept Map') => [
      {
        id: 'cm_center',
        type: 'shape',
        shapeType: 'circle',
        x: 400,
        y: 240,
        width: 160,
        height: 100,
        color: '#1e3a8a',
        fillColor: '#dbeafe',
        strokeWidth: 2,
        isRough: true,
        text: title,
        fontSize: 16,
      } as ShapeElement,
      createStickyNote(140, 140, 'Concept A: User Context', 'Core Node', '#ecfdf5'),
      createStickyNote(660, 140, 'Concept B: System Engine', 'Core Node', '#fef3c7'),
      createStickyNote(400, 390, 'Concept C: Measurable Outcome', 'Core Node', '#f5f3ff'),
    ],
  },

  affinityMap: {
    id: 'affinityMap',
    category: 'understand',
    name: 'Affinity Map',
    tagline: 'Cluster messy sticky notes into thematic groups',
    purpose: 'Synthesizes qualitative research, interview quotes, and user observations.',
    bestFor: 'Post-user interview synthesis, design sprint sense-making.',
    limitations: 'Grouping is interpretive; guard against forcing unrelated points into neat boxes.',
    sixSliceMapping: 'whoWhat',
    iconName: 'Grid',
    workedExample: {
      title: 'Customer Feedback on New Checkout',
      context: 'Clustering 50 user comments into Usability, Payment Speed, and Trust.',
      keyInsights: ['Group A: Confusion around shipping fees', 'Group B: Missing Apple Pay option'],
    },
    suggestedNextStep: 'Convert top cluster into prioritized product backlog.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(80, 100, 'Cluster 1: User Onboarding\n• Confusing setup\n• Too many steps', 'Theme 1', '#dbeafe'),
      createStickyNote(320, 100, 'Cluster 2: Performance\n• Latency on mobile\n• Battery drain', 'Theme 2', '#fef3c7'),
      createStickyNote(560, 100, 'Cluster 3: Delight\n• Love the animations\n• Quick keyboard shortcuts', 'Theme 3', '#d1fae5'),
    ],
  },

  '5w1h': {
    id: '5w1h',
    category: 'understand',
    name: '5W1H Inquiry Matrix',
    tagline: 'Who, What, Where, When, Why, and How',
    purpose: 'Comprehensive 360-degree framing of any situation or journalistic investigation.',
    bestFor: 'Project kickoffs, incident reviews, press releases, product briefs.',
    limitations: 'Does not model internal dependencies between answers.',
    sixSliceMapping: 'whoWhat',
    iconName: 'Compass',
    workedExample: {
      title: 'New Feature Brief',
      context: 'Defining the 6 dimensions of a new collaboration feature.',
      keyInsights: ['Who: Remote PMs', 'What: Async canvas', 'When: Sprint 4', 'Why: 3x faster feedback'],
    },
    suggestedNextStep: 'Identify which of the 6 answers has the highest uncertainty.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(80, 100, 'WHO: Target audience & operators', 'Who', '#e0e7ff'),
      createStickyNote(320, 100, 'WHAT: Scope, feature & deliverables', 'What', '#d1fae5'),
      createStickyNote(560, 100, 'WHERE: Channels, platforms & touchpoints', 'Where', '#fef3c7'),
      createStickyNote(80, 300, 'WHEN: Timeline & launch milestone', 'When', '#fee2e2'),
      createStickyNote(320, 300, 'WHY: Customer value & ROI', 'Why', '#f3e8ff'),
      createStickyNote(560, 300, 'HOW: Technical architecture & flow', 'How', '#cffafe'),
    ],
  },

  fiveWhys: {
    id: 'fiveWhys',
    category: 'analyze',
    name: 'Five Whys Root Cause Chain',
    tagline: 'Iterative interrogative chain drilling to the foundational root cause',
    purpose: 'Peels away superficial symptoms by asking "Why?" five consecutive times.',
    bestFor: 'Incident postmortems, manufacturing defects, operational breakdowns.',
    limitations: 'Tendency to follow a single linear branch; real problems often have multi-factor causes.',
    sixSliceMapping: 'why',
    iconName: 'HelpCircle',
    workedExample: {
      title: 'Database Outage During Launch',
      context: 'Why did the database crash? -> CPU hit 100% -> Missing index on users table -> PR skipped review -> Team lacked CI linter.',
      keyInsights: ['Root Cause: CI pipeline had no automated index lint check.'],
    },
    suggestedNextStep: 'Institute an automated safeguard at the 5th Why.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(80, 140, 'Why 1: Production site was slow', 'Level 1', '#fee2e2'),
      createStickyNote(260, 140, 'Why 2: DB CPU reached 100%', 'Level 2', '#ffedd5'),
      createStickyNote(440, 140, 'Why 3: Unindexed query executed', 'Level 3', '#fef3c7'),
      createStickyNote(620, 140, 'Why 4: Code review missed it', 'Level 4', '#ecfdf5'),
      createStickyNote(800, 140, 'Why 5: No automated PR linter!\nROOT FIX: Install CI check', 'ROOT CAUSE', '#d1fae5', '#059669'),
    ],
  },

  causalLoop: {
    id: 'causalLoop',
    category: 'analyze',
    name: 'Causal Loop Diagram',
    tagline: 'Reinforcing & balancing feedback loops in complex systems',
    purpose: 'Exposes non-linear circular dynamics, flywheel effects, and dampening constraints.',
    bestFor: 'System dynamics, network effects, viral growth, economic feedback.',
    limitations: 'Requires understanding delays and feedback polarity (+ vs -).',
    sixSliceMapping: 'how',
    iconName: 'RotateCw',
    workedExample: {
      title: 'Marketplace Liquidity Flywheel',
      context: 'More buyers attract more sellers, which increases inventory, which attracts more buyers.',
      keyInsights: ['Reinforcing Loop: Buyer volume -> Seller volume -> Inventory -> Buyer volume.'],
    },
    suggestedNextStep: 'Locate balancing constraints (e.g. support bandwidth) that could stall the loop.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(200, 120, 'Factor A: High User Content', 'Engine', '#dbeafe'),
      createStickyNote(520, 120, 'Factor B: Organic Search Traffic', 'Amplifier', '#d1fae5'),
      createStickyNote(520, 320, 'Factor C: New User Signups', 'Conversion', '#fef3c7'),
      createStickyNote(200, 320, 'Factor D: Active Community', 'Retention', '#e0e7ff'),
    ],
  },

  iceberg: {
    id: 'iceberg',
    category: 'analyze',
    name: 'Iceberg Model',
    tagline: 'Events above water, patterns, structures, and mental models below',
    purpose: 'Moves thinking beyond reacting to events down into transforming mental models.',
    bestFor: 'Cultural transformation, organizational design, wicked social problems.',
    limitations: 'Mental models are difficult to measure directly.',
    sixSliceMapping: 'why',
    iconName: 'Layers',
    workedExample: {
      title: 'Repeated Deadline Misses',
      context: 'Event: Missed sprint -> Pattern: Scope creep -> Structure: No spec signoff -> Mental Model: Fear of saying no.',
      keyInsights: ['Transform the mental model to solve the repeated events permanently.'],
    },
    suggestedNextStep: 'Design a structural change that addresses the deepest mental model.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(300, 70, '1. EVENTS (Visible Tip)\nWhat just happened? Symptom.', 'Events', '#dbeafe'),
      createStickyNote(300, 190, '2. PATTERNS & TRENDS\nWhat has been recurring over time?', 'Patterns', '#fef3c7'),
      createStickyNote(300, 310, '3. SYSTEMIC STRUCTURES\nWhat policies & habits cause this?', 'Structures', '#ffedd5'),
      createStickyNote(300, 430, '4. MENTAL MODELS (Deepest)\nWhat deep beliefs sustain this?', 'Mental Models', '#ffe4e6'),
    ],
  },

  systemMap: {
    id: 'systemMap',
    category: 'analyze',
    name: 'System Map',
    tagline: 'Entities, boundaries, and resource exchanges',
    purpose: 'Maps complex ecosystems including institutions, actors, regulations, and flows.',
    bestFor: 'Supply chains, healthcare systems, multi-sided platforms.',
    limitations: 'High complexity risk; define clear system boundaries.',
    sixSliceMapping: 'where',
    iconName: 'Network',
    workedExample: {
      title: 'Healthcare Patient Referral Flow',
      context: 'Mapping how patients flow between primary doctors, specialists, labs, and insurance.',
      keyInsights: ['Information bottleneck sits between specialist clinics and lab portals.'],
    },
    suggestedNextStep: 'Highlight where value or information gets lost in transit.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(100, 160, 'Provider / Clinic', 'Actor', '#dbeafe'),
      createStickyNote(400, 160, 'Central Health Platform', 'Core Hub', '#d1fae5'),
      createStickyNote(700, 160, 'Patient & Family', 'Consumer', '#fef3c7'),
    ],
  },

  prosCons: {
    id: 'prosCons',
    category: 'decide',
    name: 'Pros & Cons Map',
    tagline: 'Balanced side-by-side analysis of advantages and drawbacks',
    purpose: 'Gives clear visibility to arguments for and against a specific proposal.',
    bestFor: 'Quick decisions, team alignment debates, proposal evaluations.',
    limitations: 'Counting pros vs cons ignores unequal weights; quality beats quantity.',
    sixSliceMapping: 'why',
    iconName: 'Scale',
    workedExample: {
      title: 'Transitioning to Remote-First Culture',
      context: 'Leadership evaluating whether to terminate physical office lease.',
      keyInsights: ['Pros: Global talent pool, $1.2M lease savings', 'Cons: Timezone sync challenges'],
    },
    suggestedNextStep: 'Assign conviction weights and identify mitigating actions for top cons.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(140, 120, 'PROS (Benefits)\n• Faster delivery\n• Lower overhead\n• Happier team', 'Advantages', '#d1fae5', '#059669'),
      createStickyNote(520, 120, 'CONS (Risks / Costs)\n• Higher onboarding cost\n• Culture disconnect\n• Security complexity', 'Drawbacks', '#fee2e2', '#dc2626'),
    ],
  },

  decisionMatrix: {
    id: 'decisionMatrix',
    category: 'decide',
    name: 'Decision Matrix (Pugh Chart)',
    tagline: 'Multi-criteria weighted scoring of options',
    purpose: 'Compares multiple alternatives against standardized weighted evaluation criteria.',
    bestFor: 'Vendor selection, tech stack bake-offs, feature prioritization.',
    limitations: 'Pseudo-mathematical scores can create false certainty if criteria weights are arbitrary.',
    sixSliceMapping: 'howMuch',
    iconName: 'Table',
    workedExample: {
      title: 'Evaluating Cloud Hosting Providers',
      context: 'Scoring AWS vs GCP vs Vercel across Cost, DX, and Global Latency.',
      keyInsights: ['Vercel wins on DX for frontend, AWS wins on Enterprise Compliance.'],
    },
    suggestedNextStep: 'Validate whether winning score aligns with strategic intuition.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(100, 120, 'Criteria:\n1. Speed to market (40%)\n2. Long-term cost (30%)\n3. Scalability (30%)', 'Weights', '#e0e7ff'),
      createStickyNote(360, 120, 'Option A: Score 8.2\n• Top DX, slightly higher cost', 'Option A', '#d1fae5'),
      createStickyNote(620, 120, 'Option B: Score 7.1\n• Cheap, but 2x dev effort', 'Option B', '#fef3c7'),
    ],
  },

  opportunityCost: {
    id: 'opportunityCost',
    category: 'decide',
    name: 'Opportunity Cost Map',
    tagline: 'What are you giving up by choosing this path?',
    purpose: 'Forces explicit recognition of the foregone alternatives and alternative returns.',
    bestFor: 'Resource allocation, annual roadmap planning, executive commitments.',
    limitations: 'Can induce decision paralysis if every foregone path is mourned.',
    sixSliceMapping: 'why',
    iconName: 'Coins',
    workedExample: {
      title: 'Allocating Q3 to Custom Enterprise Feature',
      context: 'Choosing to build a single customer feature sacrifices core self-serve onboarding improvements.',
      keyInsights: ['Foregone: 10,000 self-serve users improved for 1 enterprise contract.'],
    },
    suggestedNextStep: 'Ensure expected return of chosen option exceeds best alternative.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(140, 140, 'CHOSEN PATH:\nEnterprise Custom Feature\nExpected Return: $120k ARR', 'Chosen Option', '#dbeafe'),
      createStickyNote(520, 140, 'FOREGONE ALTERNATIVE:\nSelf-Serve Growth Optimization\nSacrificed: 1,500 new active teams', 'Opportunity Cost', '#fee2e2'),
    ],
  },

  scenarioComparison: {
    id: 'scenarioComparison',
    category: 'decide',
    name: 'Scenario Comparison',
    tagline: 'Best Case, Base Case, and Worst Case stress tests',
    purpose: 'Evaluates resilience across plausible future states and unexpected macro shocks.',
    bestFor: 'Financial runway planning, market expansion, disaster readiness.',
    limitations: 'Rare tail risks often fall outside all three defined scenarios.',
    sixSliceMapping: 'where',
    iconName: 'GitCompare',
    workedExample: {
      title: 'Runway Forecast Under Market Downturn',
      context: 'Testing hiring plans under Bull, Neutral, and Bear revenue growth.',
      keyInsights: ['Base Case provides 18 months runway; Worst Case triggers hiring freeze at month 6.'],
    },
    suggestedNextStep: 'Define trigger conditions for switching between contingency plans.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(80, 140, 'SCENARIO 1: Optimistic (Bull)\n• 2.5x Growth\n• Series A secured', 'Best Case', '#d1fae5'),
      createStickyNote(360, 140, 'SCENARIO 2: Base Case\n• 1.4x Growth\n• 18 months runway', 'Base Case', '#fef3c7'),
      createStickyNote(640, 140, 'SCENARIO 3: Stress Test (Bear)\n• Flat revenue\n• Trigger contingency plan', 'Worst Case', '#fee2e2'),
    ],
  },

  timeline: {
    id: 'timeline',
    category: 'plan',
    name: 'Milestone Timeline',
    tagline: 'Linear progression of dates, checkpoints, and deliverables',
    purpose: 'Maps chronological commitments and release gates across calendar time.',
    bestFor: 'Product launches, conference prep, funding roadmaps.',
    limitations: 'Does not clearly communicate complex cross-stream dependencies.',
    sixSliceMapping: 'when',
    iconName: 'Clock',
    workedExample: {
      title: 'Product Beta Launch Plan',
      context: '4-phase plan spanning Month 1 through Month 4.',
      keyInsights: ['Phase 1: Alpha prototype -> Phase 2: Security audit -> Phase 3: Beta -> Phase 4: Launch.'],
    },
    suggestedNextStep: 'Link milestone gates to measurable deliverables.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(60, 160, 'M1: Architecture & Prototyping\nDeliverable: Demo', 'Month 1', '#dbeafe'),
      createStickyNote(280, 160, 'M2: Alpha Testing\nDeliverable: 10 internal users', 'Month 2', '#d1fae5'),
      createStickyNote(500, 160, 'M3: Beta Hardening\nDeliverable: Public invite list', 'Month 3', '#fef3c7'),
      createStickyNote(720, 160, 'M4: General Availability\nDeliverable: Live billing', 'Month 4', '#ffedd5'),
    ],
  },

  dependencyMap: {
    id: 'dependencyMap',
    category: 'plan',
    name: 'Dependency Map',
    tagline: 'Critical paths, blockers, and prerequisites',
    purpose: 'Surfaces structural blockers before work begins to avoid costly idle time.',
    bestFor: 'Multi-team project management, platform migrations, hardware integrations.',
    limitations: 'Can become overly tangled; focus on critical path items.',
    sixSliceMapping: 'how',
    iconName: 'Network',
    workedExample: {
      title: 'Database Migration Dependencies',
      context: 'Frontend API changes depend on Schema v2, which depends on Data Sanitization script.',
      keyInsights: ['Data Sanitization script is the critical path blocker for 3 downstream teams.'],
    },
    suggestedNextStep: 'De-risk the single most congested dependency node first.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(80, 140, 'Task A: Data Sanitization\n(PREREQUISITE FOR ALL)', 'Blocker', '#fee2e2'),
      createStickyNote(360, 140, 'Task B: Schema v2 Migration\n(Depends on Task A)', 'Midstream', '#fef3c7'),
      createStickyNote(640, 140, 'Task C: Frontend Client Update\n(Unblocked by Task B)', 'Downstream', '#d1fae5'),
    ],
  },

  goalTree: {
    id: 'goalTree',
    category: 'plan',
    name: 'Goal Tree (OKRs / Driver Tree)',
    tagline: 'Connect overarching North Star goals to leading indicator levers',
    purpose: 'Aligns company missions down through strategic objectives and tactical weekly initiatives.',
    bestFor: 'OKR setting, quarterly planning, team alignment.',
    limitations: 'Leading indicators can decouple from true North Star outcomes if not audited.',
    sixSliceMapping: 'why',
    iconName: 'Target',
    workedExample: {
      title: 'Company North Star: ARR Growth',
      context: 'Connecting $10M ARR North Star to Net Retention and New Acquisition levers.',
      keyInsights: ['Objective 1: Improve Net Retention to 125% -> Initiative: Customer health alerts.'],
    },
    suggestedNextStep: 'Convert leaf initiatives into an executable weekly sprint workflow.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(80, 180, 'NORTH STAR GOAL:\n$10M ARR with high customer NPS', 'North Star', '#dbeafe', '#1d4ed8'),
      createStickyNote(360, 100, 'Objective 1: Expand Existing Accounts\nLever: Self-serve seats', 'Objective 1', '#d1fae5'),
      createStickyNote(360, 260, 'Objective 2: Accelerate Acquisition\nLever: Interactive templates', 'Objective 2', '#fef3c7'),
    ],
  },

  feedbackLoop: {
    id: 'feedbackLoop',
    category: 'plan',
    name: 'Feedback Loop Diagram',
    tagline: 'Input, sensor, comparator, and adjustment mechanism',
    purpose: 'Models cybernetic governance and continuous learning loops.',
    bestFor: 'Agile sprints, quality assurance, telemetry instrumentation.',
    limitations: 'Loops without fast telemetry lead to delayed, erratic corrections.',
    sixSliceMapping: 'how',
    iconName: 'RotateCcw',
    workedExample: {
      title: 'Weekly Sprint Retrospective Loop',
      context: 'Observe velocity -> Compare against plan -> Retrospective insight -> Adjust sprint capacity.',
      keyInsights: ['Fast 1-week cycle keeps error correction cheap and low-stress.'],
    },
    suggestedNextStep: 'Measure the latency of the feedback signal.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(100, 140, '1. Plan & Execute Sprint', 'Action', '#dbeafe'),
      createStickyNote(400, 140, '2. Measure Real Velocity', 'Sensor', '#d1fae5'),
      createStickyNote(700, 140, '3. Retrospective Adjustment', 'Correction', '#fef3c7'),
    ],
  },

  stakeholderMap: {
    id: 'stakeholderMap',
    category: 'people',
    name: 'Stakeholder Map',
    tagline: 'Power vs. Interest influence quadrants',
    purpose: 'Identifies who holds decision authority, who is affected, and how to manage communications.',
    bestFor: 'Organizational change, sales strategy, consulting engagements.',
    limitations: 'Stakeholder interests shift dynamically; revisit after major milestones.',
    sixSliceMapping: 'whoWhat',
    iconName: 'Users',
    workedExample: {
      title: 'Enterprise Software Implementation',
      context: 'Mapping CIO (High Power / High Interest), Security Lead (High Power / Low Interest), and End Users.',
      keyInsights: ['Security lead needs proactive compliance documentation before final signoff.'],
    },
    suggestedNextStep: 'Draft bespoke communication cadence for each quadrant.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(100, 100, 'High Power / High Interest:\nMANAGE CLOSELY\n(CIO, Lead Sponsor)', 'Manage Closely', '#dbeafe'),
      createStickyNote(460, 100, 'High Power / Low Interest:\nKEEP SATISFIED\n(Security, Legal)', 'Keep Satisfied', '#fee2e2'),
      createStickyNote(100, 300, 'Low Power / High Interest:\nKEEP INFORMED\n(End Users, Champions)', 'Keep Informed', '#d1fae5'),
      createStickyNote(460, 300, 'Low Power / Low Interest:\nMONITOR\n(General Staff)', 'Monitor', '#f3f4f6'),
    ],
  },

  customerJourney: {
    id: 'customerJourney',
    category: 'people',
    name: 'Customer Journey Map',
    tagline: 'Stages, thoughts, emotional highs/lows, and pain points',
    purpose: 'Empathizes with the customer across Awareness, Evaluation, Purchase, Onboarding, and Renewal.',
    bestFor: 'UX design, customer retention audits, marketing funnel optimization.',
    limitations: 'Averages out unique user behaviors into a single generalized persona journey.',
    sixSliceMapping: 'whoWhat',
    iconName: 'UserCheck',
    workedExample: {
      title: 'First-Time Homebuyer Mortgage Journey',
      context: 'Stage 1 Research (Anxious) -> Pre-approval (Hopeful) -> Underwriting (High stress) -> Closing (Elated).',
      keyInsights: ['Biggest drop-off occurs during document upload in Underwriting.'],
    },
    suggestedNextStep: 'Focus design interventions strictly on the emotional low point.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(60, 140, '1. Discover (Curious)\n• Discovers via Google\n• Browse pricing', 'Awareness', '#dbeafe'),
      createStickyNote(280, 140, '2. Try (Hopeful)\n• Starts free trial\n• Plays with templates', 'Evaluation', '#d1fae5'),
      createStickyNote(500, 140, '3. Setup (Friction!)\n• Hits auth roadblock\n• Needs help docs', 'Pain Point', '#fee2e2'),
      createStickyNote(720, 140, '4. Value (Delighted)\n• Generates first pitch\n• Shares with team', 'Advocacy', '#fef3c7'),
    ],
  },

  empathyMap: {
    id: 'empathyMap',
    category: 'people',
    name: 'Empathy Map',
    tagline: 'Says, Thinks, Does, and Feels quadrants with Pains & Gains',
    purpose: 'Synthesizes observations to build deep shared empathy for a specific user persona.',
    bestFor: 'Design thinking workshops, product feature definition, user research synthesis.',
    limitations: 'What users say often contradicts what they actually do; look for tensions.',
    sixSliceMapping: 'whoWhat',
    iconName: 'Heart',
    workedExample: {
      title: 'Busy Engineering Manager Persona',
      context: 'Says: "I want fewer meetings" / Does: Schedules 1-on-1s / Feels: Overwhelmed by status updates.',
      keyInsights: ['Tension between wanting autonomy and needing visibility into project progress.'],
    },
    suggestedNextStep: 'Build a feature prototype that resolves the Say vs Do contradiction.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(100, 100, 'SAYS:\n"I don\'t have time for complex tools."', 'Says', '#dbeafe'),
      createStickyNote(460, 100, 'THINKS:\n"Will this make me look good to leadership?"', 'Thinks', '#fef3c7'),
      createStickyNote(100, 300, 'DOES:\nDefaults to quick sketches on paper.', 'Does', '#d1fae5'),
      createStickyNote(460, 300, 'FEELS:\nAnxious about deadlines; desires clarity.', 'Feels', '#fee2e2'),
    ],
  },

  serviceBlueprint: {
    id: 'serviceBlueprint',
    category: 'people',
    name: 'Service Blueprint',
    tagline: 'Customer actions, frontstage staff, backstage support, and systems',
    purpose: 'Connects visible customer experience with backstage operations and support software.',
    bestFor: 'Service operations, hospital workflows, hotel hospitality, SaaS billing operations.',
    limitations: 'High detail can overwhelm early exploratory conversations.',
    sixSliceMapping: 'how',
    iconName: 'Layers',
    workedExample: {
      title: 'Hotel Check-In Experience',
      context: 'Customer Action (Arrives at lobby) -> Frontstage (Receptionist greets) -> Backstage (Housekeeping flags room clean).',
      keyInsights: ['Delays happen when Housekeeping app doesn\'t sync in real time with front desk.'],
    },
    suggestedNextStep: 'Automate status updates across the Line of Visibility.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(100, 100, 'CUSTOMER LAYER:\nArrives at store / web app', 'Customer Action', '#dbeafe'),
      createStickyNote(400, 100, 'FRONTSTAGE LAYER:\nGreeter welcomes / Chatbot answers', 'Frontstage', '#d1fae5'),
      createStickyNote(700, 100, 'BACKSTAGE LAYER:\nWarehouse inventory checks / DB sync', 'Backstage', '#fef3c7'),
    ],
  },

  audienceMap: {
    id: 'audienceMap',
    category: 'people',
    name: 'Audience Map',
    tagline: 'Segment personas by sophistication, role, and visual appetite',
    purpose: 'Helps tailor pitch decks and diagrams to the exact cognitive profile of your audience.',
    bestFor: 'Preparing high-stakes pitches, board presentations, customer webinars.',
    limitations: 'Audiences in the room are often mixed; you need both simple anchors and deep backups.',
    sixSliceMapping: 'whoWhat',
    iconName: 'Eye',
    workedExample: {
      title: 'Pitching to Board vs Frontline Engineers',
      context: 'Board needs 1-page financial impact; Engineers need architecture and data schemas.',
      keyInsights: ['Never show low-level database schemas to the Board; never show vague buzzwords to engineers.'],
    },
    suggestedNextStep: 'Prepare an SQVID Simple version for executives and SQVID Detailed for technical review.',
    guidedSteps: [],
    generateElements: () => [
      createStickyNote(100, 140, 'EXECUTIVE AUDIENCE:\n• Needs: 30-second bottom line\n• Diagram: Simple metric + 2x2', 'Executives', '#dbeafe'),
      createStickyNote(420, 140, 'OPERATOR AUDIENCE:\n• Needs: Workflow steps & handoffs\n• Diagram: Process flowchart', 'Operators', '#d1fae5'),
      createStickyNote(740, 140, 'TECHNICAL AUDIENCE:\n• Needs: Architecture & edge cases\n• Diagram: Deep system map', 'Engineers', '#fee2e2'),
    ],
  },
};

export const PRIORITIZED_FRAMEWORK_IDS: FrameworkId[] = [
  'mindMap',
  'questionTree',
  'causeEffect',
  'decisionTree',
  'workflow',
  'sqvid',
];

// Helper to get all frameworks by category
export function getFrameworksByCategory(cat: FrameworkCategory): FrameworkDefinition[] {
  return Object.values(FRAMEWORKS_REGISTRY).filter((f) => f.category === cat);
}
