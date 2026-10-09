export type Tool =
  | 'select'
  | 'pen'
  | 'highlighter'
  | 'smart'
  | 'eraser'
  | 'shape'
  | 'text'
  | 'connector'
  | 'model'
  | 'stamp';

export type ShapeType =
  | 'rect'
  | 'circle'
  | 'arrow'
  | 'diamond'
  | 'triangle'
  | 'line'
  | 'bubble'
  | 'star'
  | 'cloud'
  | 'stickman';

export type PaperTexture =
  | 'napkin'      // Classic warm napkin texture
  | 'grid'        // Dot / Square graph paper
  | 'kraft'       // Warm cafe kraft paper
  | 'blueprint'   // Dark slate blueprint
  | 'clean';      // Pure crisp white

export type SixSliceType =
  | 'whoWhat'     // Portraits, players, cards
  | 'howMuch'     // Charts, quantities
  | 'where'       // 2x2 Matrix, Venn, Maps
  | 'when'        // Timelines, Roadmaps
  | 'how'         // Flowcharts, Processes
  | 'why';        // Trade-offs, Balance, S-Curves

export type SemanticTag =
  | 'fact'
  | 'assumption'
  | 'hypothesis'
  | 'question'
  | 'evidence_needed'
  | 'decision'
  | 'action';

export interface SemanticMeta {
  tag?: SemanticTag;
  evidenceNotes?: string;
  confidence?: 'low' | 'medium' | 'high';
  sourceRef?: string;
}

export type FrameworkCategory =
  | 'understand'  // A. Understand and organize
  | 'analyze'     // B. Analyze problems and systems
  | 'decide'      // C. Make decisions
  | 'plan'        // D. Plan and execute
  | 'people'      // E. Understand people and experiences
  | 'foundations';// SQVID, CODEX & Six Visual Forms

export type FrameworkId =
  // A. Understand and organize
  | 'mindMap'
  | 'conceptMap'
  | 'affinityMap'
  | '5w1h'
  | 'questionTree'
  // B. Analyze problems and systems
  | 'causeEffect'
  | 'fiveWhys'
  | 'causalLoop'
  | 'iceberg'
  | 'systemMap'
  // C. Make decisions
  | 'decisionTree'
  | 'prosCons'
  | 'decisionMatrix'
  | 'opportunityCost'
  | 'scenarioComparison'
  // D. Plan and execute
  | 'timeline'
  | 'workflow'
  | 'dependencyMap'
  | 'goalTree'
  | 'feedbackLoop'
  // E. Understand people and experiences
  | 'stakeholderMap'
  | 'customerJourney'
  | 'empathyMap'
  | 'serviceBlueprint'
  | 'audienceMap'
  // Foundations
  | 'sqvid'
  | 'codex';

export type GoalOptionId =
  | 'understand_complex'
  | 'analyze_problem'
  | 'choose_alternatives'
  | 'explore_ideas'
  | 'plan_execute'
  | 'explain_others';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface StrokeElement extends SemanticMeta {
  id: string;
  type: 'stroke';
  tool: 'pen' | 'highlighter';
  points: Point[];
  color: string;
  width: number;
  isRough?: boolean;
}

export interface ShapeElement extends SemanticMeta {
  id: string;
  type: 'shape';
  shapeType: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fillColor?: string;
  strokeWidth: number;
  isRough: boolean;
  roughness?: number;
  text?: string;
  fontSize?: number;
  startPoint?: Point;
  endPoint?: Point;
}

export interface TextElement extends SemanticMeta {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: 'Kalam' | 'Patrick Hand' | 'Outfit' | 'Caveat';
}

export interface ConnectorElement extends SemanticMeta {
  id: string;
  type: 'connector';
  fromId?: string;
  toId?: string;
  fromPoint: Point;
  toPoint: Point;
  label?: string;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  lineStyle?: 'solid' | 'dashed' | 'curved';
  color: string;
  strokeWidth: number;
  isRough?: boolean;
}

export interface ModelElement extends SemanticMeta {
  id: string;
  type: 'model';
  modelKind:
    | 'matrix2x2'
    | 'barchart'
    | 'piechart'
    | 'timeline'
    | 'flowchart'
    | 'balance'
    | 'venn'
    | 'scurve'
    | 'stickmanScene'
    | 'stickyNote'
    | 'mindMapNode'
    | 'questionNode'
    | 'causeEffectNode'
    | 'decisionCard';
  sliceCategory: SixSliceType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fillColor: string;
  isRough: boolean;
  data: any;
}

export interface StampElement extends SemanticMeta {
  id: string;
  type: 'stamp';
  stampIcon: string;
  x: number;
  y: number;
  size: number;
  color: string;
  fillColor?: string;
  label?: string;
}

export type CanvasElement =
  | StrokeElement
  | ShapeElement
  | TextElement
  | ModelElement
  | StampElement
  | ConnectorElement;

export interface GuidedStep {
  id: string;
  question: string;
  hint: string;
  placeholder?: string;
  fieldKey: string;
  suggestedSemanticTag?: SemanticTag;
  actionLabel?: string;
}

export interface Slide {
  id: string;
  title: string;
  sliceTag?: SixSliceType;
  frameworkId?: FrameworkId;
  questionPrompt?: string;
  notes?: string;
  paperTexture: PaperTexture;
  elements: CanvasElement[];
  guidedData?: {
    currentStepIndex: number;
    answers: Record<string, any>;
    history: string[];
    isCompleted?: boolean;
  };
}

export interface ProjectState {
  title: string;
  slides: Slide[];
  activeSlideId: string;
  lastGoalPrompt?: string;
}
