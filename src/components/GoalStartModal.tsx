import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  HelpCircle,
  Activity,
  GitBranch,
  CalendarCheck,
  Eye,
  ArrowRight,
  X,
  Compass,
  FileQuestion,
  Layers,
} from 'lucide-react';
import type { FrameworkId, GoalOptionId } from '../types';
import { FRAMEWORKS_REGISTRY } from '../utils/frameworkRegistry';

interface GoalStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFramework: (frameworkId: FrameworkId, userGoalPrompt?: string, openGuided?: boolean) => void;
  onStartBlank: () => void;
  onOpenLibrary: () => void;
}

interface GoalCard {
  id: GoalOptionId;
  label: string;
  tagline: string;
  icon: React.ReactNode;
  defaultFrameworkId: FrameworkId;
  colorClass: string;
  accentColor: string;
}

const GOALS_LIST: GoalCard[] = [
  {
    id: 'understand_complex',
    label: 'Understand something complicated',
    tagline: 'Deconstruct a dense concept, domain, or multifaceted brief',
    icon: <HelpCircle size={20} />,
    defaultFrameworkId: 'mindMap',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#2563eb',
  },
  {
    id: 'analyze_problem',
    label: 'Figure out why a problem exists',
    tagline: 'Diagnose root causes, identify failure points, and test contributing factors',
    icon: <Activity size={20} />,
    defaultFrameworkId: 'causeEffect',
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: '#e11d48',
  },
  {
    id: 'choose_alternatives',
    label: 'Choose between alternatives',
    tagline: 'Evaluate competing options, weigh trade-offs, and clarify conviction',
    icon: <GitBranch size={20} />,
    defaultFrameworkId: 'decisionTree',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
    accentColor: '#d97706',
  },
  {
    id: 'explore_ideas',
    label: 'Explore and develop ideas',
    tagline: 'Brainstorm alternative perspectives along Dan Roam’s SQVID dimensions',
    icon: <Compass size={20} />,
    defaultFrameworkId: 'sqvid',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: '#7c3aed',
  },
  {
    id: 'plan_execute',
    label: 'Turn an idea into a plan',
    tagline: 'Sequence steps, map dependencies, decision gates, and milestone timelines',
    icon: <CalendarCheck size={20} />,
    defaultFrameworkId: 'workflow',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#059669',
  },
  {
    id: 'explain_others',
    label: 'Explain something to another person',
    tagline: 'Select the optimal visual representation using Dan Roam’s CODEX matrix',
    icon: <Eye size={20} />,
    defaultFrameworkId: 'codex',
    colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentColor: '#4f46e5',
  },
];

export const GoalStartModal: React.FC<GoalStartModalProps> = ({
  isOpen,
  onClose,
  onSelectFramework,
  onStartBlank,
  onOpenLibrary,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<GoalOptionId>('understand_complex');
  const [problemDescription, setProblemDescription] = useState('');

  // Determine recommended framework based on goal + description keywords
  const recommendation = useMemo(() => {
    const text = problemDescription.toLowerCase();
    const activeGoal = GOALS_LIST.find((g) => g.id === selectedGoalId) || GOALS_LIST[0];
    let recommendedId: FrameworkId = activeGoal.defaultFrameworkId;
    let rationale = '';

    if (selectedGoalId === 'analyze_problem') {
      if (text.includes('why') || text.includes('recursive') || text.includes('incident')) {
        recommendedId = 'fiveWhys';
        rationale = 'Your description emphasizes iterative diagnostic inquiry ("why"), making a 5 Whys Root Cause Chain ideal.';
      } else if (text.includes('feedback') || text.includes('loop') || text.includes('cycle')) {
        recommendedId = 'causalLoop';
        rationale = 'Feedback loop dynamics detected. A Causal Loop Diagram will expose system reinforcers and dampeners.';
      } else {
        recommendedId = 'causeEffect';
        rationale = 'A Cause-and-Effect Fishbone diagram systematically partitions possible drivers across People, Process, Tools, and Environment.';
      }
    } else if (selectedGoalId === 'understand_complex') {
      if (text.includes('question') || text.includes('how to') || text.includes('should we')) {
        recommendedId = 'questionTree';
        rationale = 'Your inquiry is question-centric. A Question Tree structures dilemmas into testable MECE sub-questions.';
      } else {
        recommendedId = 'mindMap';
        rationale = 'A Mind Map offers rapid radial brainstorming outward from your core ambiguous topic.';
      }
    } else if (selectedGoalId === 'choose_alternatives') {
      if (text.includes('matrix') || text.includes('criteria') || text.includes('score')) {
        recommendedId = 'decisionMatrix';
        rationale = 'Evaluating multiple options across weighted criteria is best structured in a Decision Matrix.';
      } else if (text.includes('pro') || text.includes('con') || text.includes('against')) {
        recommendedId = 'prosCons';
        rationale = 'A balanced Pros & Cons map provides instant side-by-side visibility of arguments.';
      } else {
        recommendedId = 'decisionTree';
        rationale = 'A Decision Map clarifies branching paths, key trade-offs, and the killer assumption that could reverse the choice.';
      }
    } else if (selectedGoalId === 'plan_execute') {
      if (text.includes('month') || text.includes('date') || text.includes('phase') || text.includes('quarter')) {
        recommendedId = 'timeline';
        rationale = 'Chronological milestones and calendar phases are best represented in a Milestone Timeline.';
      } else if (text.includes('block') || text.includes('depend') || text.includes('prerequisite')) {
        recommendedId = 'dependencyMap';
        rationale = 'A Dependency Map surfaces critical path blockers before work begins.';
      } else {
        recommendedId = 'workflow';
        rationale = 'A Workflow Pipeline maps step-by-step handoffs, automated triggers, and decision gates.';
      }
    } else if (selectedGoalId === 'explore_ideas') {
      recommendedId = 'sqvid';
      rationale = 'Dan Roam’s SQVID 5-dimension compass helps you generate contrasting visual angles (Simple vs Detailed, Qual vs Quant, Vision vs Reality).';
    } else {
      recommendedId = 'codex';
      rationale = 'Dan Roam’s CODEX matrix aligns the 6 fundamental visual questions (Who, How Much, Where, When, How, Why) with your audience.';
    }

    const framework = FRAMEWORKS_REGISTRY[recommendedId];
    return {
      framework,
      rationale,
    };
  }, [selectedGoalId, problemDescription]);

  if (!isOpen) return null;

  const handleStart = (openGuided: boolean) => {
    onSelectFramework(
      recommendation.framework.id,
      problemDescription.trim() || undefined,
      openGuided
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200/90 w-full max-w-3xl overflow-hidden flex flex-col max-h-[86vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-sans tracking-tight">
                What are you trying to figure out?
              </h2>
              <p className="text-[11px] text-stone-500">
                Pick your cognitive objective to jumpstart with a tailored visual framework.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. Goal Selector Cards */}
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2 font-sans">
              1. Choose what you want to achieve
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {GOALS_LIST.map((goal) => {
                const isSelected = selectedGoalId === goal.id;
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoalId(goal.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500/30 shadow-sm'
                        : 'border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 bg-white'
                    }`}
                  >
                    <div
                      className="p-1.5 rounded-lg shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${goal.accentColor}15`,
                        color: goal.accentColor,
                      }}
                    >
                      {goal.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-800 leading-tight">
                        {goal.label}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1 leading-snug line-clamp-2">
                        {goal.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Optional Problem Description Input */}
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5 font-sans">
              2. Describe your problem or question (optional)
            </span>
            <textarea
              rows={2}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="e.g. Why are users dropping off during onboarding, or what architecture trade-offs exist between SaaS vs custom?"
              className="w-full text-xs p-2.5 bg-stone-50/70 border border-stone-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans text-stone-800 placeholder:text-stone-400"
            />
          </div>

          {/* 3. Recommended Framework Spotlight */}
          <div className="p-3.5 rounded-xl border border-blue-200/90 bg-blue-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-sans flex items-center gap-1.5">
                <Sparkles size={11} className="text-blue-600" />
                Recommended Framework
              </span>
              <span className="text-[11px] text-stone-500 truncate max-w-[260px]">
                {recommendation.framework.tagline}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              <div>
                <h3 className="text-sm font-bold text-stone-900 font-sans">
                  {recommendation.framework.name}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed max-w-lg">
                  {recommendation.rationale}
                </p>
              </div>

              {/* Action Buttons for recommended framework */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleStart(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Start Guided</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => handleStart(false)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/90 font-semibold text-xs transition-all"
                >
                  Quick Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Alternatives */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
            <FileQuestion size={13} />
            <span>Need a blank slate or different model?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenLibrary();
              }}
              className="px-2.5 py-1.5 rounded-lg hover:bg-stone-200/60 text-stone-700 font-semibold transition-colors flex items-center gap-1.5 text-xs"
            >
              <Layers size={13} />
              <span>All 25+ Frameworks</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onStartBlank();
              }}
              className="px-2.5 py-1.5 rounded-lg hover:bg-stone-200/60 text-stone-700 font-semibold transition-colors text-xs"
            >
              Start Blank Napkin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
