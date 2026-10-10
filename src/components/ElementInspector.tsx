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
  RotateCcw,
  RotateCw,
  Layers,
  Boxes,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from 'lucide-react';
import type { CanvasElement, ConnectorElement, SemanticTag } from '../types';
import { SEMANTIC_TAG_LIST, SEMANTIC_TAGS_MAP } from '../utils/semanticTags';

interface ElementInspectorProps {
  selectedElement: CanvasElement | null;
  selectedElements?: CanvasElement[];
  onUpdateElement: (updated: CanvasElement) => void;
  onUpdateElements?: (updated: CanvasElement[]) => void;
  onDeleteElement: (id: string) => void;
  onDeleteElements?: (ids: string[]) => void;
  onDuplicateElement: (id: string) => void;
  onDuplicateElements?: (ids: string[]) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onGroupElements?: () => void;
  onUngroupElements?: () => void;
  onAlignElements?: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onRotateElements?: (degrees: number) => void;
  onApplyContextAction?: (actionId: string, element: CanvasElement) => void;
}

export const ElementInspector: React.FC<ElementInspectorProps> = ({
  selectedElement,
  selectedElements = [],
  onUpdateElement,
  onUpdateElements,
  onDeleteElement,
  onDeleteElements,
  onDuplicateElement,
  onDuplicateElements,
  onBringToFront,
  onSendToBack,
  onGroupElements,
  onUngroupElements,
  onAlignElements,
  onRotateElements,
  onApplyContextAction,
}) => {
  const [showEvidenceField, setShowEvidenceField] = useState(false);

  // If multiple elements selected
  const isMultiSelect = selectedElements.length > 1;
  const activeElement = selectedElement || (selectedElements.length > 0 ? selectedElements[0] : null);

  if (!activeElement && selectedElements.length === 0) return null;

  // Group status detection
  const allShareGroupId =
    selectedElements.length > 0 &&
    Boolean(selectedElements[0]?.groupId) &&
    selectedElements.every((e) => e.groupId === selectedElements[0]?.groupId);

  const anyInGroup = selectedElements.some((e) => Boolean(e.groupId)) || Boolean(activeElement?.groupId);

  // Rotate single element
  const handleRotateSingle = (deltaDeg: number) => {
    if (!activeElement) return;
    const currentRad = activeElement.rotation || 0;
    const newRad = ((currentRad + (deltaDeg * Math.PI) / 180) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    onUpdateElement({
      ...activeElement,
      rotation: newRad,
    });
  };

  // Reset rotation to 0
  const handleResetRotation = () => {
    if (isMultiSelect) {
      onRotateElements?.(0);
    } else if (activeElement) {
      onUpdateElement({
        ...activeElement,
        rotation: 0,
      });
    }
  };

  // MULTI-SELECTION VIEW
  if (isMultiSelect) {
    return (
      <div className="absolute top-16 right-5 z-20 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-2xl p-3 flex flex-col gap-3 w-72 text-stone-700 animate-in fade-in slide-in-from-right-2 duration-100 select-none max-h-[85vh] overflow-y-auto">
        {/* Multi-Select Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Boxes size={14} className="text-blue-600" />
            <span className="text-xs font-bold text-stone-800 font-['Outfit']">
              {allShareGroupId ? `Group (${selectedElements.length} items)` : `${selectedElements.length} items selected`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              title="Duplicate All (Ctrl+D)"
              onClick={() => {
                if (onDuplicateElements) onDuplicateElements(selectedElements.map((e) => e.id));
                else selectedElements.forEach((e) => onDuplicateElement(e.id));
              }}
              className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Copy size={13} />
            </button>
            <button
              title="Bring All to Front"
              onClick={() => selectedElements.forEach((e) => onBringToFront(e.id))}
              className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowUp size={13} />
            </button>
            <button
              title="Send All to Back"
              onClick={() => selectedElements.forEach((e) => onSendToBack(e.id))}
              className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowDown size={13} />
            </button>
            <button
              title="Delete All (Del / Backspace)"
              onClick={() => {
                if (onDeleteElements) onDeleteElements(selectedElements.map((e) => e.id));
                else selectedElements.forEach((e) => onDeleteElement(e.id));
              }}
              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Group / Ungroup Action Button */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
            Grouping & Structure
          </label>
          {allShareGroupId ? (
            <button
              onClick={onUngroupElements}
              className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-2 transition-all shadow-sm"
              title="Ungroup selected objects (Ctrl+Shift+G)"
            >
              <Layers size={13} className="text-amber-600" />
              <span>Ungroup Selection (Ctrl+Shift+G)</span>
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={onGroupElements}
                className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
                title="Group selected objects together (Ctrl+G)"
              >
                <Boxes size={13} />
                <span>Group Objects (Ctrl+G)</span>
              </button>
              {anyInGroup && (
                <button
                  onClick={onUngroupElements}
                  className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 transition-all"
                  title="Ungroup any grouped elements in selection"
                >
                  <Layers size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Alignment Controls */}
        {onAlignElements && (
          <div className="space-y-1 pt-1 border-t border-stone-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
              Align Objects
            </label>
            <div className="grid grid-cols-6 gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200/80">
              <button
                onClick={() => onAlignElements('left')}
                title="Align Left"
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-stone-600 flex items-center justify-center transition-all"
              >
                <AlignLeft size={13} />
              </button>
              <button
                onClick={() => onAlignElements('center')}
                title="Align Center Horizontally"
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-stone-600 flex items-center justify-center transition-all"
              >
                <AlignCenter size={13} />
              </button>
              <button
                onClick={() => onAlignElements('right')}
                title="Align Right"
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-stone-600 flex items-center justify-center transition-all"
              >
                <AlignRight size={13} />
              </button>
              <button
                onClick={() => onAlignElements('top')}
                title="Align Top"
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-stone-600 flex items-center justify-center transition-all"
              >
                <AlignVerticalJustifyStart size={13} />
              </button>
              <button
                onClick={() => onAlignElements('middle')}
                title="Align Middle Vertically"
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-stone-600 flex items-center justify-center transition-all"
              >
                <AlignVerticalJustifyCenter size={13} />
              </button>
              <button
                onClick={() => onAlignElements('bottom')}
                title="Align Bottom"
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-stone-600 flex items-center justify-center transition-all"
              >
                <AlignVerticalJustifyEnd size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Rotate Group Controls */}
        <div className="space-y-1 pt-1 border-t border-stone-100">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
            Rotate Group
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onRotateElements?.(-90)}
              title="Rotate 90° CCW"
              className="flex-1 py-1 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              <span>-90°</span>
            </button>
            <button
              onClick={() => onRotateElements?.(90)}
              title="Rotate 90° CW"
              className="flex-1 py-1 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <RotateCw size={12} />
              <span>+90°</span>
            </button>
            <button
              onClick={handleResetRotation}
              title="Reset Rotation (0°)"
              className="py-1 px-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-lg transition-colors"
            >
              0°
            </button>
          </div>
        </div>

        {/* Bulk Reasoning Label Assignment */}
        <div className="space-y-1.5 pt-1 border-t border-stone-100">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 font-['Outfit']">
            <Tag size={11} className="text-blue-600" />
            Apply Label to All
          </label>
          <div className="flex flex-wrap gap-1">
            {SEMANTIC_TAG_LIST.map((tagItem) => (
              <button
                key={tagItem.id}
                onClick={() => {
                  if (onUpdateElements) {
                    const updated = selectedElements.map((el) => ({ ...el, tag: tagItem.id }));
                    onUpdateElements(updated);
                  } else {
                    selectedElements.forEach((el) => onUpdateElement({ ...el, tag: tagItem.id }));
                  }
                }}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg border bg-white hover:bg-stone-50 text-stone-600 border-stone-200 transition-all"
              >
                {tagItem.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SINGLE ELEMENT VIEW
  if (!activeElement) return null;

  const currentTag = activeElement.tag;
  const currentTagMeta = currentTag ? SEMANTIC_TAGS_MAP[currentTag] : null;

  const handleSelectTag = (tag?: SemanticTag) => {
    onUpdateElement({
      ...activeElement,
      tag,
    });
  };

  const handleUpdateEvidence = (notes: string) => {
    onUpdateElement({
      ...activeElement,
      evidenceNotes: notes,
    });
  };

  const handleUpdateConfidence = (conf: 'low' | 'medium' | 'high') => {
    onUpdateElement({
      ...activeElement,
      confidence: conf,
    });
  };

  const currentRotDeg = Math.round(
    ((((activeElement.rotation || 0) * 180) / Math.PI) % 360 + 360) % 360
  );

  return (
    <div className="absolute top-16 right-5 z-20 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-2xl p-3 flex flex-col gap-3 w-72 text-stone-700 animate-in fade-in slide-in-from-right-2 duration-100 select-none max-h-[85vh] overflow-y-auto">
      {/* Top Header & Quick Actions */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
            Selected: {activeElement.type}
          </span>
          {activeElement.groupId && (
            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
              Grouped
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Duplicate (Ctrl+D)"
            onClick={() => onDuplicateElement(activeElement.id)}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Copy size={13} />
          </button>
          <button
            title="Bring to Front"
            onClick={() => onBringToFront(activeElement.id)}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowUp size={13} />
          </button>
          <button
            title="Send to Back"
            onClick={() => onSendToBack(activeElement.id)}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowDown size={13} />
          </button>
          <button
            title="Delete (Backspace / Del)"
            onClick={() => onDeleteElement(activeElement.id)}
            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Grouping Status for Single Element */}
      {activeElement.groupId && (
        <div className="flex items-center justify-between bg-amber-50/70 p-2 rounded-xl border border-amber-200/80 text-xs">
          <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
            <Boxes size={13} />
            <span>Member of a group</span>
          </div>
          <button
            onClick={onUngroupElements}
            className="text-[10px] font-bold bg-white hover:bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200 transition-colors"
            title="Ungroup (Ctrl+Shift+G)"
          >
            Ungroup
          </button>
        </div>
      )}

      {/* Rotation Controls */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
            Rotation Angle
          </label>
          <span className="text-[11px] font-bold text-blue-600 font-mono">{currentRotDeg}°</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleRotateSingle(-90)}
            title="Rotate -90°"
            className="flex-1 py-1 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw size={12} />
            <span>-90°</span>
          </button>
          <button
            onClick={() => handleRotateSingle(90)}
            title="Rotate +90°"
            className="flex-1 py-1 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCw size={12} />
            <span>+90°</span>
          </button>
          <button
            onClick={handleResetRotation}
            title="Reset to 0°"
            className="py-1 px-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-lg transition-colors"
          >
            0°
          </button>
        </div>
      </div>

      {/* 1. SEMANTIC UNCERTAINTY & REASONING BADGE */}
      <div className="space-y-1.5 pt-1 border-t border-stone-100">
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
            <span>{activeElement.evidenceNotes ? 'Edit Evidence Note' : '+ Add Evidence & Source'}</span>
          </button>

          {(showEvidenceField || activeElement.evidenceNotes) && (
            <div className="mt-1.5 p-2 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-1.5 text-xs animate-in fade-in duration-100">
              <textarea
                rows={2}
                value={activeElement.evidenceNotes || ''}
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
                        activeElement.confidence === lvl
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
      {activeElement.type === 'connector' && (
        <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
            Connector Options
          </label>
          <div>
            <label className="text-[11px] font-bold text-stone-500">Connector Label:</label>
            <input
              type="text"
              value={activeElement.label || ''}
              placeholder="e.g. Informs, Triggers, Leads to..."
              onChange={(e) =>
                onUpdateElement({ ...activeElement, label: e.target.value })
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
                      ...activeElement,
                      lineStyle: style,
                    } as ConnectorElement)
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                    (activeElement as ConnectorElement).lineStyle === style
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
      {activeElement.type === 'text' && (
        <div className="space-y-2 pt-1 border-t border-stone-100">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
            Text Content
          </label>
          <textarea
            rows={2}
            value={activeElement.text}
            onChange={(e) => onUpdateElement({ ...activeElement, text: e.target.value })}
            className="w-full text-xs p-2 border border-stone-200 rounded-lg outline-none font-sans text-stone-800 placeholder:text-stone-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-500">Font Size:</span>
            <input
              type="range"
              min="14"
              max="48"
              value={activeElement.fontSize}
              onChange={(e) =>
                onUpdateElement({ ...activeElement, fontSize: Number(e.target.value) })
              }
              className="w-24"
            />
            <span className="font-bold text-xs">{activeElement.fontSize}px</span>
          </div>
        </div>
      )}

      {/* 4. SHAPE ELEMENT QUICK TEXT & CONTROLS */}
      {activeElement.type === 'shape' && (
        <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-['Outfit']">
            Shape Label
          </label>
          <input
            type="text"
            value={activeElement.text || ''}
            placeholder="Type label inside shape..."
            onChange={(e) => onUpdateElement({ ...activeElement, text: e.target.value })}
            className="w-full text-xs p-1.5 border border-stone-200 rounded-lg outline-none font-sans text-stone-800 placeholder:text-stone-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      )}

      {/* 5. MODEL ELEMENT QUICK EDITORS */}
      {activeElement.type === 'model' && (
        <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
          <div className="font-bold text-stone-800 font-['Outfit']">{activeElement.title}</div>
          {activeElement.modelKind === 'stickyNote' && (
            <div>
              <label className="text-[11px] font-bold text-stone-500">Sticky Note Content:</label>
              <textarea
                rows={3}
                value={activeElement.data.text || ''}
                onChange={(e) =>
                  onUpdateElement({
                    ...activeElement,
                    data: { ...activeElement.data, text: e.target.value },
                  })
                }
                className="w-full text-xs p-2 border border-stone-200 rounded-lg outline-none font-sans text-stone-800 placeholder:text-stone-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {activeElement.modelKind === 'matrix2x2' && (
            <div className="space-y-1.5">
              <div>
                <label className="text-[10px] text-stone-400 font-bold">X Axis:</label>
                <input
                  type="text"
                  value={activeElement.data.xAxis || ''}
                  onChange={(e) =>
                    onUpdateElement({
                      ...activeElement,
                      data: { ...activeElement.data, xAxis: e.target.value },
                    })
                  }
                  className="w-full text-xs p-1 border border-stone-200 rounded"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 font-bold">Y Axis:</label>
                <input
                  type="text"
                  value={activeElement.data.yAxis || ''}
                  onChange={(e) =>
                    onUpdateElement({
                      ...activeElement,
                      data: { ...activeElement.data, yAxis: e.target.value },
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
              onClick={() => onApplyContextAction('break_questions', activeElement)}
              className="text-left px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-blue-50 text-stone-700 hover:text-blue-700 border border-stone-200/80 hover:border-blue-200 text-xs font-medium transition-all flex items-center justify-between"
            >
              <span>❓ Break into sub-questions</span>
              <span className="text-[10px] text-stone-400">MECE</span>
            </button>
            <button
              onClick={() => onApplyContextAction('explore_causes', activeElement)}
              className="text-left px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 border border-stone-200/80 hover:border-emerald-200 text-xs font-medium transition-all flex items-center justify-between"
            >
              <span>🔍 Explore contributing causes</span>
              <span className="text-[10px] text-stone-400">Why?</span>
            </button>
            <button
              onClick={() => onApplyContextAction('turn_into_action', activeElement)}
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
