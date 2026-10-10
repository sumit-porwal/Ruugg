import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Copy,
  Layers,
} from 'lucide-react';
import type { CanvasElement, FrameworkCategory, FrameworkId } from '../types';
import {
  FRAMEWORKS_REGISTRY,
  PRIORITIZED_FRAMEWORK_IDS,
  getFrameworksByCategory,
} from '../utils/frameworkRegistry';
import { proposeFrameworkTransformation } from '../utils/frameworkSwitcher';

interface FrameworkSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentElements: CanvasElement[];
  currentSlideTitle: string;
  currentFrameworkId?: FrameworkId;
  initialTargetId?: FrameworkId;
  onConfirmSwitch: (
    transformedElements: CanvasElement[],
    targetFrameworkId: FrameworkId,
    asNewSlide: boolean
  ) => void;
}

export const FrameworkSwitchModal: React.FC<FrameworkSwitchModalProps> = ({
  isOpen,
  onClose,
  currentElements,
  currentSlideTitle,
  currentFrameworkId,
  initialTargetId,
  onConfirmSwitch,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<FrameworkId>(() => {
    if (initialTargetId && initialTargetId in FRAMEWORKS_REGISTRY) return initialTargetId;
    const defaultPick = PRIORITIZED_FRAMEWORK_IDS.find((id) => id !== currentFrameworkId);
    return defaultPick || 'questionTree';
  });

  const [categoryFilter, setCategoryFilter] = useState<'prioritized' | FrameworkCategory>('prioritized');

  const [prevInitialId, setPrevInitialId] = useState(initialTargetId);
  if (initialTargetId !== prevInitialId) {
    setPrevInitialId(initialTargetId);
    if (initialTargetId && initialTargetId in FRAMEWORKS_REGISTRY) {
      setSelectedTargetId(initialTargetId);
    }
  }

  // Compute live proposal
  const proposal = useMemo(() => {
    return proposeFrameworkTransformation(
      currentElements,
      currentSlideTitle,
      selectedTargetId
    );
  }, [currentElements, currentSlideTitle, selectedTargetId]);

  if (!isOpen) return null;

  const currentDef = currentFrameworkId ? FRAMEWORKS_REGISTRY[currentFrameworkId] : null;

  const frameworkList =
    categoryFilter === 'prioritized'
      ? PRIORITIZED_FRAMEWORK_IDS.map((id) => FRAMEWORKS_REGISTRY[id]).filter(Boolean)
      : getFrameworksByCategory(categoryFilter);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200/90 w-full max-w-3xl h-[560px] max-h-[calc(100vh-2rem)] sm:max-h-[86vh] flex flex-col overflow-hidden my-auto">
        {/* Header - Fixed at top */}
        <div className="shrink-0 px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <GitCompare size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 font-sans tracking-tight">
                  Switch Thinking Framework
                </h2>
                {currentDef && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                    From: {currentDef.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 truncate">
                Transform diagram structure while preserving every node, note, and semantic tag.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body - Side-by-side columns with independent scroll areas */}
        <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
          {/* Left Column: Target Framework Selection */}
          <div className="w-52 sm:w-60 shrink-0 border-r border-stone-100 flex flex-col min-h-0 bg-stone-50/40">
            {/* Category Filter Pills */}
            <div className="shrink-0 p-2 border-b border-stone-100/80 flex items-center gap-1 overflow-x-auto text-[10px]">
              {(
                [
                  { id: 'prioritized', label: 'Top 6' },
                  { id: 'understand', label: 'Organize' },
                  { id: 'analyze', label: 'Analyze' },
                  { id: 'decide', label: 'Decide' },
                  { id: 'plan', label: 'Plan' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2 py-1 rounded-md font-semibold shrink-0 transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
              {frameworkList.map((def) => {
                const isSelected = selectedTargetId === def.id;
                const isCurrent = currentFrameworkId === def.id;

                return (
                  <button
                    key={def.id}
                    onClick={() => setSelectedTargetId(def.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-bold font-sans truncate">{def.name}</div>
                      {isCurrent && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            isSelected ? 'bg-blue-700 text-blue-100' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-stone-400'
                      }`}
                    >
                      {def.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Proposed Transformation Preview & Pinned Action Bar */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col justify-between bg-white">
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3">
              {/* Rationale Banner */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-sans flex items-center gap-1.5 truncate">
                    <Sparkles size={11} className="text-blue-600 shrink-0" />
                    Target: {proposal.targetFrameworkName}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 shrink-0">
                    {proposal.mappedNodeCount} thoughts mapped
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {proposal.rationale}
                </p>
              </div>

              {/* Preservation Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 font-sans flex items-center gap-1.5">
                    <Layers size={13} className="text-stone-500" />
                    Preservation & Structural Mapping
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    0 thoughts lost
                  </span>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 max-h-48 overflow-y-auto">
                  {proposal.preservationSummary.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pinned Bottom Action Bar */}
            <div className="shrink-0 px-4 py-3 border-t border-stone-100 bg-stone-50/60 flex items-center justify-between gap-2">
              <span className="text-[11px] text-stone-400 hidden sm:inline">
                Non-destructive: Use Ctrl+Z anytime to undo.
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => {
                    onConfirmSwitch(
                      proposal.transformedElements,
                      proposal.targetFrameworkId,
                      true
                    );
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/90 font-medium text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                  title="Create a duplicate slide transformed into the new framework, keeping your original slide intact"
                >
                  <Copy size={13} />
                  <span>Branch as New Slide</span>
                </button>
                <button
                  onClick={() => {
                    onConfirmSwitch(
                      proposal.transformedElements,
                      proposal.targetFrameworkId,
                      false
                    );
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
                  title="Transform the current slide in-place"
                >
                  <span>Transform Active Slide</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
