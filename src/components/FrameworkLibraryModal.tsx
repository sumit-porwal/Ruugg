import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  Plus,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  Share2,
  Activity,
  GitBranch,
  CalendarCheck,
  Users,
  GitCompare,
} from 'lucide-react';
import type { FrameworkCategory, FrameworkId } from '../types';
import {
  COGNITIVE_CATEGORIES,
  FRAMEWORKS_REGISTRY,
  getFrameworksByCategory,
  PRIORITIZED_FRAMEWORK_IDS,
} from '../utils/frameworkRegistry';

interface FrameworkLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFramework: (frameworkId: FrameworkId, asNewSlide: boolean, startGuided?: boolean) => void;
  onOpenSqvidStudio?: () => void;
  onSwitchToFramework?: (frameworkId: FrameworkId) => void;
}

export const FrameworkLibraryModal: React.FC<FrameworkLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertFramework,
  onOpenSqvidStudio,
  onSwitchToFramework,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FrameworkCategory>('understand');
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<FrameworkId>('mindMap');

  if (!isOpen) return null;

  const currentCategoryFrameworks = getFrameworksByCategory(selectedCategory);
  const activeFramework =
    FRAMEWORKS_REGISTRY[selectedFrameworkId] || currentCategoryFrameworks[0] || FRAMEWORKS_REGISTRY.mindMap;

  const handleSelectCategory = (cat: FrameworkCategory) => {
    setSelectedCategory(cat);
    const frameworks = getFrameworksByCategory(cat);
    if (frameworks.length > 0) {
      setSelectedFrameworkId(frameworks[0].id);
    }
  };

  const getCategoryIcon = (cat: FrameworkCategory) => {
    switch (cat) {
      case 'understand':
        return <Share2 size={16} />;
      case 'analyze':
        return <Activity size={16} />;
      case 'decide':
        return <GitBranch size={16} />;
      case 'plan':
        return <CalendarCheck size={16} />;
      case 'people':
        return <Users size={16} />;
      case 'foundations':
        return <Sparkles size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200/90 w-full max-w-4xl h-[580px] max-h-[calc(100vh-2rem)] sm:max-h-[88vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="shrink-0 px-5 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-sans tracking-tight">
                Visual Thinking Frameworks
              </h2>
              <p className="text-[11px] text-stone-500">
                Cognitive models to turn ambiguous thoughts into clear visual diagrams.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="shrink-0 px-4 py-2 bg-white border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto">
          {COGNITIVE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body: Left Column (Frameworks List), Right Column (Detailed Spec & Worked Example) */}
        <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
          {/* Left Column: Frameworks within selected category */}
          <div className="w-52 sm:w-60 border-r border-stone-100 p-2 space-y-1 overflow-y-auto bg-stone-50/40 shrink-0 min-h-0">
            {currentCategoryFrameworks.map((f) => {
              const isSelected = selectedFrameworkId === f.id;
              const isPrioritized = PRIORITIZED_FRAMEWORK_IDS.includes(f.id);

              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFrameworkId(f.id)}
                  className={`w-full flex items-start gap-2 p-2.5 rounded-xl text-left transition-all relative ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'hover:bg-stone-100/90 text-stone-700 bg-white border border-stone-200/70'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold font-sans truncate">{f.name}</span>
                      {isPrioritized && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0 ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Core
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                        isSelected ? 'text-blue-100' : 'text-stone-400'
                      }`}
                    >
                      {f.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: In-depth Framework Spec, Purpose, Limitations, & Worked Example */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-white">
            {/* Title & Tagline */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 font-sans tracking-tight">
                    {activeFramework.name}
                  </h3>
                  {activeFramework.id === 'sqvid' && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      SQVID
                    </span>
                  )}
                  {activeFramework.id === 'codex' && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      CODEX
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{activeFramework.tagline}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {activeFramework.id === 'sqvid' && onOpenSqvidStudio && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSqvidStudio();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles size={13} />
                    <span>SQVID Studio</span>
                  </button>
                )}
                {activeFramework.guidedSteps.length > 0 && (
                  <button
                    onClick={() => {
                      onInsertFramework(activeFramework.id, true, true);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <PlayCircle size={13} />
                    <span>Start Guided</span>
                  </button>
                )}
                {onSwitchToFramework && (
                  <button
                    onClick={() => {
                      onClose();
                      onSwitchToFramework(activeFramework.id);
                    }}
                    title="Convert and map current slide's ideas into this framework"
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <GitCompare size={13} />
                    <span>Switch to this</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onInsertFramework(activeFramework.id, false, false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-all flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Insert</span>
                </button>
              </div>
            </div>

            {/* Purpose & Problem Fit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-sans flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  Purpose & Problem Fit
                </span>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {activeFramework.purpose}
                </p>
                <div className="pt-1 text-[11px] text-stone-500">
                  <strong className="text-stone-700">Best for:</strong> {activeFramework.bestFor}
                </div>
              </div>

              {/* Limitations */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-sans flex items-center gap-1">
                  <AlertCircle size={11} />
                  Limitations
                </span>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {activeFramework.limitations}
                </p>
                <div className="pt-1 text-[11px] text-amber-800">
                  <strong>Suggested next step:</strong> {activeFramework.suggestedNextStep}
                </div>
              </div>
            </div>

            {/* Worked Example */}
            <div className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-sans">
                Worked Example
              </span>
              <h4 className="text-xs font-bold text-stone-800 font-sans">
                {activeFramework.workedExample.title}
              </h4>
              <p className="text-[11px] text-stone-500 italic">
                "{activeFramework.workedExample.context}"
              </p>
              <div className="space-y-1 pt-0.5">
                {activeFramework.workedExample.keyInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contextual Prompts / Questions */}
            {activeFramework.guidedSteps.length > 0 && (
              <div className="space-y-1.5 pt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-sans">
                  Interactive Guided Questions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeFramework.guidedSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs space-y-0.5"
                    >
                      <div className="font-bold text-stone-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{step.question}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 pl-5.5 leading-snug">{step.hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between text-xs text-stone-500">
          <span className="text-[11px]">
            {currentCategoryFrameworks.length} frameworks • fully interactive and non-destructive
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onInsertFramework(activeFramework.id, true, false);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/90 font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span>Create as New Slide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
