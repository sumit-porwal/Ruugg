import React, { useState } from 'react';
import {
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Tag,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  Award,
  CheckSquare,
  FileText,
} from 'lucide-react';
import type { CanvasElement, ConnectorElement, SemanticTag } from '../types';
import { SEMANTIC_TAG_LIST, SEMANTIC_TAGS_MAP } from '../utils/semanticTags';

interface ElementInspectorProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (updated: CanvasElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onApplyContextAction?: (actionId: string, element: CanvasElement) => void;
}

export const ElementInspector: React.FC<ElementInspectorProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  onSendToBack,
  onApplyContextAction,
}) => {
  const [showEvidenceField, setShowEvidenceField] = useState(false);

  if (!selectedElement) return null;

  const currentTag = selectedElement.tag;
  const currentTagMeta = currentTag ? SEMANTIC_TAGS_MAP[currentTag] : null;

  const handleSelectTag = (tag?: SemanticTag) => {
    onUpdateElement({
      ...selectedElement,
      tag,
    });
  };

  const handleUpdateEvidence = (notes: string) => {
    onUpdateElement({
      ...selectedElement,
      evidenceNotes: notes,
    });
  };

  const handleUpdateConfidence = (conf: 'low' | 'medium' | 'high') => {
    onUpdateElement({
      ...selectedElement,
      confidence: conf,
    });
  };

  return (
    <div className="absolute top-16 right-5 z-20 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-2xl p-3 flex flex-col gap-3 w-72 text-stone-700 animate-in fade-in slide-in-from-right-2 duration-100 select-none max-h-[85vh] overflow-y-auto">
      {/* Top Header & Quick Actions */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
          Selected: {selectedElement.type}
        </span>
        <div className="flex items-center gap-1">
          <button
            title="Duplicate (Ctrl+D)"
            onClick={() => onDuplicateElement(selectedElement.id)}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Copy size={13} />
          </button>
          <button
            title="Bring to Front"
            onClick={() => onBringToFront(selectedElement.id)}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowUp size={13} />
          </button>
          <button
            title="Send to Back"
            onClick={() => onSendToBack(selectedElement.id)}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowDown size={13} />
          </button>
          <button
            title="Delete (Backspace / Del)"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 1. SEMANTIC UNCERTAINTY & REASONING BADGE */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 font-['Outfit']">
            <Tag size={11} className="text-blue-600" />
            Reasoning Label
          </label>
          {currentTag && (
            <button
              onClick={() => handleSelectTag(undefined)}
              className="text-[10px] text-stone-400 hover:text-stone-600 underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Selected badge status pill */}
        {currentTagMeta ? (
          <div
            className="px-2.5 py-1.5 rounded-xl border flex items-center justify-between transition-all"
            style={{
              backgroundColor: currentTagMeta.bgColor,
              borderColor: currentTagMeta.borderColor,
              color: currentTagMeta.color,
            }}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold font-['Outfit']">
              {currentTag === 'fact' && <CheckCircle2 size={13} />}
              {currentTag === 'assumption' && <AlertCircle size={13} />}
              {currentTag === 'hypothesis' && <Sparkles size={13} />}
              {currentTag === 'question' && <HelpCircle size={13} />}
              {currentTag === 'evidence_needed' && <Search size={13} />}
              {currentTag === 'decision' && <Award size={13} />}
              {currentTag === 'action' && <CheckSquare size={13} />}
              <span>{currentTagMeta.label}</span>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-70">Active</span>
          </div>
        ) : (
          <div className="text-[11px] text-stone-400 italic">No semantic label assigned yet.</div>
        )}

        {/* Quick chip selector */}
        <div className="flex flex-wrap gap-1 pt-1">
          {SEMANTIC_TAG_LIST.map((tagItem) => {
            const isSelected = currentTag === tagItem.id;
            return (
              <button
                key={tagItem.id}
                onClick={() => handleSelectTag(isSelected ? undefined : tagItem.id)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'ring-1 shadow-sm'
                    : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
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

        {/* Evidence / Uncertainty Notes */}
        <div className="pt-1.5">
          <button
            onClick={() => setShowEvidenceField(!showEvidenceField)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <FileText size={12} />
            <span>{selectedElement.evidenceNotes ? 'Edit Evidence Note' : '+ Add Evidence & Source'}</span>
          </button>

          {(showEvidenceField || selectedElement.evidenceNotes) && (
            <div className="mt-1.5 p-2 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-1.5 text-xs animate-in fade-in duration-100">
              <textarea
                rows={2}
                value={selectedElement.evidenceNotes || ''}
                onChange={(e) => handleUpdateEvidence(e.target.value)}
                placeholder="Log verified data, source reference, or reason for uncertainty..."
                className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg outline-none font-sans text-stone-800 placeholder:text-stone-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-stone-500">Confidence:</span>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleUpdateConfidence(lvl)}
                      className={`px-1.5 py-0.5 rounded uppercase font-bold text-[9px] ${
                        selectedElement.confidence === lvl
                          ? 'bg-blue-600 text-white'
                          : 'bg-stone-200/80 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. CONNECTOR SPECIFIC CONTROLS */}
      {selectedElement.type === 'connector' && (
        <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
            Connector Options
          </label>
          <div>
            <label className="text-[11px] font-bold text-stone-500">Connector Label:</label>
            <input
              type="text"
              value={selectedElement.label || ''}
              placeholder="e.g. Informs, Triggers, Leads to..."
              onChange={(e) =>
                onUpdateElement({ ...selectedElement, label: e.target.value })
              }
              className="w-full text-xs p-1.5 border border-stone-200 rounded-lg outline-none font-sans text-stone-800 placeholder:text-stone-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500">Style:</span>
            <div className="flex gap-1">
              {(['curved', 'solid', 'dashed'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() =>
                    onUpdateElement({
                      ...selectedElement,
                      lineStyle: style,
                    } as ConnectorElement)
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                    (selectedElement as ConnectorElement).lineStyle === style
                      ? 'bg-blue-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. TEXT ELEMENT EDITOR */}
      {selectedElement.type === 'text' && (
        <div className="space-y-2 pt-1 border-t border-stone-100">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
            Text Content
          </label>
          <textarea
            rows={2}
            value={selectedElement.text}
            onChange={(e) => onUpdateElement({ ...selectedElement, text: e.target.value })}
            className="w-full text-xs p-2 border border-stone-200 rounded-lg outline-none font-sans text-stone-800 placeholder:text-stone-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-500">Font Size:</span>
            <input
              type="range"
              min="14"
              max="48"
              value={selectedElement.fontSize}
              onChange={(e) =>
                onUpdateElement({ ...selectedElement, fontSize: Number(e.target.value) })
              }
              className="w-24"
            />
            <span className="font-bold text-xs">{selectedElement.fontSize}px</span>
          </div>
        </div>
      )}

      {/* 4. SHAPE ELEMENT QUICK TEXT & CONTROLS */}
      {selectedElement.type === 'shape' && (
        <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
            Shape Label
          </label>
          <input
            type="text"
            value={selectedElement.text || ''}
            placeholder="Type label inside shape..."
            onChange={(e) => onUpdateElement({ ...selectedElement, text: e.target.value })}
            className="w-full text-xs p-1.5 border border-stone-200 rounded-lg outline-none font-sans text-stone-800 placeholder:text-stone-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      )}

      {/* 5. MODEL ELEMENT QUICK EDITORS */}
      {selectedElement.type === 'model' && (
        <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
          <div className="font-bold text-stone-800 font-['Outfit']">{selectedElement.title}</div>
          {selectedElement.modelKind === 'stickyNote' && (
            <div>
              <label className="text-[11px] font-bold text-stone-500">Sticky Note Note:</label>
              <textarea
                rows={3}
                value={selectedElement.data.text || ''}
                onChange={(e) =>
                  onUpdateElement({
                    ...selectedElement,
                    data: { ...selectedElement.data, text: e.target.value },
                  })
                }
                className="w-full text-xs p-2 border border-stone-200 rounded-lg outline-none font-sans text-stone-800 placeholder:text-stone-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {selectedElement.modelKind === 'matrix2x2' && (
            <div className="space-y-1.5">
              <div>
                <label className="text-[10px] text-stone-400 font-bold">X Axis:</label>
                <input
                  type="text"
                  value={selectedElement.data.xAxis || ''}
                  onChange={(e) =>
                    onUpdateElement({
                      ...selectedElement,
                      data: { ...selectedElement.data, xAxis: e.target.value },
                    })
                  }
                  className="w-full text-xs p-1 border border-stone-200 rounded"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 font-bold">Y Axis:</label>
                <input
                  type="text"
                  value={selectedElement.data.yAxis || ''}
                  onChange={(e) =>
                    onUpdateElement({
                      ...selectedElement,
                      data: { ...selectedElement.data, yAxis: e.target.value },
                    })
                  }
                  className="w-full text-xs p-1 border border-stone-200 rounded"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. CONTEXTUAL THINKING ACTIONS */}
      {onApplyContextAction && (
        <div className="pt-2 border-t border-stone-100 space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 font-['Outfit']">
            <Sparkles size={11} />
            <span>Contextual Thinking Actions</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => onApplyContextAction('break_questions', selectedElement)}
              className="text-left px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-blue-50 text-stone-700 hover:text-blue-700 border border-stone-200/80 hover:border-blue-200 text-xs font-medium transition-all flex items-center justify-between"
            >
              <span>❓ Break into sub-questions</span>
              <span className="text-[10px] text-stone-400">MECE</span>
            </button>
            <button
              onClick={() => onApplyContextAction('explore_causes', selectedElement)}
              className="text-left px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 border border-stone-200/80 hover:border-emerald-200 text-xs font-medium transition-all flex items-center justify-between"
            >
              <span>🔍 Explore contributing causes</span>
              <span className="text-[10px] text-stone-400">Why?</span>
            </button>
            <button
              onClick={() => onApplyContextAction('turn_into_action', selectedElement)}
              className="text-left px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-amber-700 border border-stone-200/80 hover:border-amber-200 text-xs font-medium transition-all flex items-center justify-between"
            >
              <span>⚡ Convert into next action item</span>
              <span className="text-[10px] text-stone-400">Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
