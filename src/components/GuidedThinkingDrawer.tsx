import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import type {
  CanvasElement,
  FrameworkId,
  GuidedStep,
  SemanticTag,
  ShapeElement,
} from '../types';
import { FRAMEWORKS_REGISTRY } from '../utils/frameworkRegistry';
import { SEMANTIC_TAG_LIST, SEMANTIC_TAGS_MAP } from '../utils/semanticTags';
import { createStickyNote } from '../utils/sixSlicesTemplates';

interface GuidedThinkingDrawerProps {
  frameworkId: FrameworkId;
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  onClose: () => void;
  onQuickMessage?: (msg: string) => void;
  initialAnswers?: Record<string, string>;
}

export const GuidedThinkingDrawer: React.FC<GuidedThinkingDrawerProps> = ({
  frameworkId,
  elements,
  onElementsChange,
  onClose,
  onQuickMessage,
  initialAnswers = {},
}) => {
  const framework = FRAMEWORKS_REGISTRY[frameworkId] || FRAMEWORKS_REGISTRY.mindMap;
  const steps: GuidedStep[] = framework.guidedSteps;

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [currentInput, setCurrentInput] = useState(
    initialAnswers[steps[0]?.fieldKey] || ''
  );
  const [selectedTag, setSelectedTag] = useState<SemanticTag | undefined>(
    steps[0]?.suggestedSemanticTag
  );
  const [isMinimized, setIsMinimized] = useState(false);

  const activeStep = steps[currentStepIdx] || steps[0];

  if (!activeStep) return null;

  const handleNextStep = () => {
    const trimmed = currentInput.trim();
    const updatedAnswers = {
      ...answers,
      [activeStep.fieldKey]: trimmed,
    };
    setAnswers(updatedAnswers);

    // If user provided input, dynamically place or update the relevant visual element on canvas!
    if (trimmed) {
      addStepElementToCanvas(activeStep, trimmed, selectedTag);
    }

    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const nextStep = steps[nextIdx];
      setCurrentInput(updatedAnswers[nextStep.fieldKey] || '');
      setSelectedTag(nextStep.suggestedSemanticTag);
    } else {
      onQuickMessage?.(`🎉 Framework thinking complete for ${framework.name}! Suggested next step: ${framework.suggestedNextStep}`);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      const prevStep = steps[prevIdx];
      setCurrentInput(answers[prevStep.fieldKey] || '');
      setSelectedTag(prevStep.suggestedSemanticTag);
    }
  };

  // Helper to dynamically insert visual thinking node onto canvas based on step
  const addStepElementToCanvas = (
    step: GuidedStep,
    text: string,
    tag?: SemanticTag
  ) => {
    const canvasCenterX = 180 + (currentStepIdx % 3) * 240;
    const canvasCenterY = 160 + Math.floor(currentStepIdx / 3) * 180;

    let newElement: CanvasElement;

    if (tag === 'action') {
      newElement = {
        id: `guided_act_${Math.random().toString(36).substring(2, 9)}`,
        type: 'shape',
        shapeType: 'bubble',
        x: canvasCenterX,
        y: canvasCenterY,
        width: 210,
        height: 85,
        color: '#059669',
        fillColor: '#d1fae5',
        strokeWidth: 2,
        isRough: true,
        text: `NEXT ACTION:\n${text}`,
        fontSize: 14,
        tag: 'action',
      } as ShapeElement;
    } else if (tag === 'decision') {
      newElement = {
        id: `guided_dec_${Math.random().toString(36).substring(2, 9)}`,
        type: 'shape',
        shapeType: 'diamond',
        x: canvasCenterX,
        y: canvasCenterY,
        width: 190,
        height: 120,
        color: '#2563eb',
        fillColor: '#eff6ff',
        strokeWidth: 2,
        isRough: true,
        text,
        fontSize: 14,
        tag: 'decision',
      } as ShapeElement;
    } else {
      newElement = createStickyNote(
        canvasCenterX,
        canvasCenterY,
        text,
        tag ? SEMANTIC_TAGS_MAP[tag].label : step.question.substring(0, 18),
        tag ? SEMANTIC_TAGS_MAP[tag].bgColor : '#fef9c3',
        tag ? SEMANTIC_TAGS_MAP[tag].color : '#d97706'
      );
      newElement.tag = tag;
    }

    onElementsChange([...elements, newElement]);
    onQuickMessage?.(`✨ Added "${text.substring(0, 24)}..." to canvas!`);
  };

  return (
    <div
      className={`fixed bottom-16 left-5 z-40 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-xl transition-all duration-200 select-none overflow-hidden ${
        isMinimized ? 'w-72 h-12' : 'w-[350px] max-w-[calc(100vw-2.5rem)]'
      }`}
    >
      {/* Header bar */}
      <div className="px-3.5 py-2.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <Sparkles size={12} />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-900 font-sans flex items-center gap-1.5">
              <span className="truncate max-w-[140px]">{framework.name}</span>
              <span className="text-[10px] text-blue-600 font-semibold px-1.5 py-0.2 rounded-full bg-blue-50 border border-blue-100">
                {currentStepIdx + 1}/{steps.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors"
            title="Close guided assistant"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Body when expanded */}
      {!isMinimized && (
        <div className="p-3.5 space-y-3">
          {/* Active Question */}
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-stone-900 leading-snug font-sans">
              {activeStep.question}
            </h4>
            <p className="text-[11px] text-stone-500 leading-snug font-sans">
              💡 {activeStep.hint}
            </p>
          </div>

          {/* User Input field */}
          <div className="space-y-2">
            <textarea
              rows={2}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={activeStep.placeholder || 'Type your reflection or answer here...'}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans text-stone-800 placeholder:text-stone-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleNextStep();
                }
              }}
            />

            {/* Semantic Tag Selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block font-sans">
                Tag this reflection:
              </span>
              <div className="flex flex-wrap gap-1">
                {SEMANTIC_TAG_LIST.map((tagItem) => {
                  const isSelected = selectedTag === tagItem.id;
                  return (
                    <button
                      key={tagItem.id}
                      onClick={() => setSelectedTag(isSelected ? undefined : tagItem.id)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'ring-1 shadow-2xs'
                          : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200/80'
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: tagItem.bgColor,
                              borderColor: tagItem.borderColor,
                              color: tagItem.color,
                            }
                          : {}
                      }
                    >
                      {tagItem.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-1.5 border-t border-stone-100">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIdx === 0}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-0.5 transition-colors ${
                currentStepIdx === 0
                  ? 'text-stone-300 pointer-events-none'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <ChevronLeft size={13} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (currentStepIdx < steps.length - 1) {
                    const nextIdx = currentStepIdx + 1;
                    setCurrentStepIdx(nextIdx);
                    const nextStep = steps[nextIdx];
                    setCurrentInput(answers[nextStep.fieldKey] || '');
                    setSelectedTag(nextStep.suggestedSemanticTag);
                  }
                }}
                className="text-[11px] text-stone-400 hover:text-stone-600 font-medium px-2 py-1"
              >
                Skip
              </button>
              <button
                onClick={handleNextStep}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1"
              >
                <span>{currentStepIdx === steps.length - 1 ? 'Finish' : 'Add to Canvas'}</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
