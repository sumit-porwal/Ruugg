import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
  PenTool,
  Highlighter,
  Wand2,
  Square,
  Circle,
  ArrowRight,
  Diamond,
  Triangle,
  MessageSquare,
  Star,
  User,
  Type,
  Eraser,
  StickyNote,
  Sparkles,
  Layers,
  Palette,
  ChevronDown,
  Sliders,
  Pipette,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Tablet,
} from 'lucide-react';
import type { CanvasElement, PaperTexture, ShapeType, Tool } from '../types';

interface ToolbarProps {
  currentTool: Tool;
  onSelectTool: (tool: Tool) => void;
  currentColor: string;
  onSelectColor: (color: string) => void;
  strokeWidth: number;
  onSelectStrokeWidth: (width: number) => void;
  eraserSize?: number;
  onSelectEraserSize?: (size: number) => void;
  onClearCanvas?: () => void;
  currentShapeType: ShapeType;
  onSelectShapeType: (shape: ShapeType) => void;
  isRough: boolean;
  onToggleRough: () => void;
  paperTexture: PaperTexture;
  onSelectPaperTexture: (texture: PaperTexture) => void;
  onOpenSixSlices: () => void;
  onOpenStamps: () => void;
  onAddStickyNote: () => void;
  // Selected Element enhancements
  selectedElement?: CanvasElement | null;
  onUpdateElement?: (updated: CanvasElement) => void;
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  hasCanvasElements?: boolean;
  onOpenStylusSettings?: () => void;
  isStylusActive?: boolean;
}

const COLOR_PALETTE = [
  { hex: '#1e293b', name: 'Napkin Black' },
  { hex: '#2563eb', name: 'Roam Blue' },
  { hex: '#dc2626', name: 'Sharpie Red' },
  { hex: '#16a34a', name: 'Growth Green' },
  { hex: '#f59e0b', name: 'Amber Marker' },
  { hex: '#ea580c', name: 'Accent Orange' },
  { hex: '#7c3aed', name: 'Insight Violet' },
  { hex: '#e11d48', name: 'Rose Red' },
  { hex: '#0891b2', name: 'Cyan Blue' },
  { hex: '#ffffff', name: 'Chalk White' },
];

const THICKNESS_PRESETS = [
  { width: 1, label: 'Ultra Fine (1px)' },
  { width: 2, label: 'Fine Pen (2px)' },
  { width: 4, label: 'Felt Marker (4px)' },
  { width: 8, label: 'Bold Sharpie (8px)' },
  { width: 12, label: 'Chisel Tip (12px)' },
  { width: 16, label: 'Jumbo (16px)' },
];

const SHAPES_LIST: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
  { type: 'rect', label: 'Rectangle', icon: <Square size={16} /> },
  { type: 'circle', label: 'Circle', icon: <Circle size={16} /> },
  { type: 'arrow', label: 'Arrow', icon: <ArrowRight size={16} /> },
  { type: 'diamond', label: 'Decision Diamond', icon: <Diamond size={16} /> },
  { type: 'triangle', label: 'Triangle / Delta', icon: <Triangle size={16} /> },
  { type: 'bubble', label: 'Speech Bubble', icon: <MessageSquare size={16} /> },
  { type: 'star', label: 'Priority Star', icon: <Star size={16} /> },
  { type: 'stickman', label: 'Stick Person', icon: <User size={16} /> },
];

const TEXTURE_LIST: { type: PaperTexture; label: string; previewClass: string }[] = [
  { type: 'napkin', label: 'Cafe Napkin', previewClass: 'bg-[#f7f0df] border-amber-300/80' },
  { type: 'kraft', label: 'Kraft Cafe', previewClass: 'bg-[#f6f0e2] border-amber-300' },
  { type: 'grid', label: 'Dot Grid', previewClass: 'bg-[#fcfbf7] border-blue-200' },
  { type: 'blueprint', label: 'Blueprint', previewClass: 'bg-[#0f172a] border-cyan-700' },
  { type: 'clean', label: 'Clean White', previewClass: 'bg-white border-stone-300' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  currentColor,
  onSelectColor,
  strokeWidth,
  onSelectStrokeWidth,
  eraserSize = 24,
  onSelectEraserSize,
  onClearCanvas,
  currentShapeType,
  onSelectShapeType,
  isRough,
  onToggleRough,
  paperTexture,
  onSelectPaperTexture,
  onOpenSixSlices,
  onOpenStamps,
  onAddStickyNote,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  onSendToBack,
  hasCanvasElements = false,
  onOpenStylusSettings,
  isStylusActive = false,
}) => {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showContextShapeMenu, setShowContextShapeMenu] = useState(false);
  const [showTextureMenu, setShowTextureMenu] = useState(false);
  const [showPenMenu, setShowPenMenu] = useState(false);
  const [showEraserMenu, setShowEraserMenu] = useState(false);

  const isPenMenuOpen = showPenMenu && currentTool === 'pen';
  const isShapeMenuOpen = showShapeMenu && currentTool === 'shape';
  const isContextShapeMenuOpen = showContextShapeMenu && currentTool === 'shape';
  const isEraserMenuOpen = showEraserMenu && currentTool === 'eraser';

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
      {/* Primary Floating Toolbar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-xl shadow-stone-900/10 text-stone-700 transition-all select-none relative z-30">
        {/* Select */}
        <button
          title="Select & Move (V)"
          onClick={() => {
            onSelectTool('select');
            setShowPenMenu(false);
          }}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            currentTool === 'select'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'hover:bg-stone-100 text-stone-600'
          }`}
        >
          <MousePointer size={18} />
        </button>

        {/* Hand / Pan Tool */}
        <button
          title="Hand / Pan Tool (H or hold Space) — Drag to move around canvas"
          onClick={() => {
            onSelectTool('hand');
            setShowPenMenu(false);
          }}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            currentTool === 'hand'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'hover:bg-stone-100 text-stone-600'
          }`}
        >
          <Hand size={18} />
        </button>

        {/* Felt Pen & Pen Options */}
        <div className="relative">
          <button
            title="Felt Marker Pen (P) — Click again to configure stroke & color"
            onClick={() => {
              if (currentTool !== 'pen') {
                onSelectTool('pen');
              } else {
                setShowPenMenu(!isPenMenuOpen);
              }
            }}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-1 ${
              currentTool === 'pen'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <div className="relative flex items-center">
              <PenTool size={18} />
              {/* Color dot badge showing current pen color */}
              <span
                className="absolute -bottom-1 -right-1.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: currentColor }}
              />
            </div>
            {currentTool === 'pen' && (
              <ChevronDown size={12} className={`transition-transform opacity-80 ${isPenMenuOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Dedicated Pen Settings Popover */}
          {isPenMenuOpen && (
            <div className="absolute top-12 left-0 w-64 bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl shadow-2xl p-3 z-30 flex flex-col gap-3 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-800 font-['Outfit'] flex items-center gap-1.5">
                  <PenTool size={14} className="text-blue-600" />
                  Pen Settings
                </span>
                <span className="text-[11px] font-bold text-blue-600 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                  {strokeWidth}px
                </span>
              </div>

              {/* Live Stroke Preview Swatch */}
              <div className="h-10 bg-stone-100/70 rounded-xl border border-stone-200/80 flex items-center justify-center overflow-hidden px-4">
                <div
                  className="rounded-full transition-all w-full shadow-sm"
                  style={{
                    backgroundColor: currentColor,
                    height: `${Math.min(26, strokeWidth)}px`,
                  }}
                />
              </div>

              {/* Stroke Thickness Presets */}
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                  Stroke Thickness
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {THICKNESS_PRESETS.map((t) => (
                    <button
                      key={t.width}
                      onClick={() => onSelectStrokeWidth(t.width)}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                        strokeWidth === t.width
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/20'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span
                        className="rounded-full bg-current mb-1 shrink-0"
                        style={{ width: `${Math.min(16, Math.max(3, t.width * 1.5))}px`, height: `${Math.min(16, Math.max(3, t.width * 1.5))}px` }}
                      />
                      <span>{t.width}px</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Continuous Thickness Slider */}
              <div className="flex items-center gap-2 px-1">
                <Sliders size={13} className="text-stone-400" />
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={strokeWidth}
                  onChange={(e) => onSelectStrokeWidth(Number(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                />
                <span className="text-xs font-bold text-stone-700 w-8 text-right font-['Outfit']">{strokeWidth}px</span>
              </div>

              {/* Pen Colors */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Pen Color
                  </span>
                  {/* Custom Color Picker */}
                  <label className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer hover:underline relative">
                    <Pipette size={12} />
                    <span>Custom</span>
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => onSelectColor(e.target.value)}
                      className="sr-only"
                      style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      title={c.name}
                      onClick={() => onSelectColor(c.hex)}
                      className={`h-7 rounded-lg border flex items-center justify-center transition-all ${
                        currentColor === c.hex ? 'ring-2 ring-blue-500 scale-105 shadow-sm' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: c.hex,
                        borderColor: c.hex === '#ffffff' ? '#cbd5e1' : 'rgba(0,0,0,0.12)',
                      }}
                    >
                      {currentColor === c.hex && (
                        <span className={`text-[11px] font-bold ${c.hex === '#ffffff' || c.hex === '#f59e0b' ? 'text-stone-900' : 'text-white'}`}>
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Digital Pen / Tablet Studio Shortcut */}
              {onOpenStylusSettings && (
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
                    <Tablet size={13} className="text-blue-600" />
                    Stylus / Tablet Studio
                  </span>
                  <button
                    onClick={() => {
                      setShowPenMenu(false);
                      onOpenStylusSettings();
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Configure →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Highlighter */}
        <button
          title="Highlighter (H)"
          onClick={() => onSelectTool('highlighter')}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            currentTool === 'highlighter'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'hover:bg-stone-100 text-stone-600'
          }`}
        >
          <Highlighter size={18} />
        </button>

        {/* Smart Assistant */}
        <button
          title="Smart Assistant Draw: Auto-beautifies scribbles into napkin shapes (A)"
          onClick={() => onSelectTool('smart')}
          className={`relative p-2.5 rounded-xl transition-all flex items-center justify-center ${
            currentTool === 'smart'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
              : 'hover:bg-violet-50 text-violet-700'
          }`}
        >
          <Wand2 size={18} />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
          </span>
        </button>

        <div className="w-[1px] h-6 bg-stone-200 mx-0.5" />

        {/* Shapes Menu Dropdown */}
        <div className="relative">
          <button
            title="Shapes & Metaphors"
            onClick={() => {
              if (currentTool !== 'shape') {
                onSelectTool('shape');
              } else {
                setShowShapeMenu(!isShapeMenuOpen);
              }
            }}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-1 ${
              currentTool === 'shape'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            {SHAPES_LIST.find((s) => s.type === currentShapeType)?.icon || <Square size={18} />}
          </button>

          {isShapeMenuOpen && (
            <div className="absolute top-12 left-0 w-52 bg-white border border-stone-200/90 rounded-2xl shadow-2xl p-2 grid grid-cols-2 gap-1.5 z-50 animate-in fade-in duration-100">
              {SHAPES_LIST.map((s) => (
                <button
                  key={s.type}
                  onClick={() => {
                    onSelectShapeType(s.type);
                    onSelectTool('shape');
                    setShowShapeMenu(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-left transition-all ${
                    currentShapeType === s.type
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'hover:bg-stone-50 text-stone-700 border border-transparent'
                  }`}
                >
                  <span className={currentShapeType === s.type ? 'text-blue-600' : 'text-stone-500'}>
                    {s.icon}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text */}
        <button
          title="Handwriting Text (T)"
          onClick={() => onSelectTool('text')}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            currentTool === 'text'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'hover:bg-stone-100 text-stone-600'
          }`}
        >
          <Type size={18} />
        </button>

        {/* Sticky Note */}
        <button
          title="Add Sticky Note Memo (N)"
          onClick={onAddStickyNote}
          className="p-2.5 rounded-xl transition-all flex items-center justify-center hover:bg-amber-50 text-amber-600"
        >
          <StickyNote size={18} />
        </button>

        <div className="w-[1px] h-6 bg-stone-200 mx-0.5" />

        {/* 6-Slices Models Button */}
        <button
          title="6 Slices Visual Models (Charts, 2x2, Timelines, Flowcharts)"
          onClick={onOpenSixSlices}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 font-semibold text-xs transition-all shadow-sm"
        >
          <Layers size={16} />
          <span>6 Slices Models</span>
        </button>

        {/* Visual Vocabulary Stamps */}
        <button
          title="Visual Vocabulary Metaphors & Stamps"
          onClick={onOpenStamps}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-stone-100 text-stone-700 font-medium text-xs transition-all"
        >
          <Sparkles size={16} className="text-amber-500" />
          <span>Stamps</span>
        </button>

        {/* Eraser Tool with Intuitive Popover */}
        <div className="relative">
          <button
            title="Eraser (E) — Click again for eraser size & options"
            onClick={() => {
              setShowShapeMenu(false);
              setShowTextureMenu(false);
              setShowPenMenu(false);
              if (currentTool !== 'eraser') {
                onSelectTool('eraser');
              } else {
                setShowEraserMenu(!isEraserMenuOpen);
              }
            }}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-1 ${
              currentTool === 'eraser'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                : 'hover:bg-rose-50 text-rose-600'
            }`}
          >
            <Eraser size={18} />
            {currentTool === 'eraser' && (
              <ChevronDown
                size={12}
                className={`transition-transform opacity-80 ${isEraserMenuOpen ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {/* Dedicated Eraser Settings Popover */}
          {isEraserMenuOpen && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl shadow-2xl p-3 z-30 flex flex-col gap-3 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-800 font-['Outfit'] flex items-center gap-1.5">
                  <Eraser size={14} className="text-rose-600" />
                  Napkin Eraser
                </span>
                <span className="text-[11px] font-bold text-rose-600 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100">
                  {eraserSize}px
                </span>
              </div>

              {/* Live Eraser Ring Footprint */}
              <div className="h-14 bg-stone-100/70 rounded-xl border border-stone-200/80 flex items-center justify-center overflow-hidden">
                <div
                  className="rounded-full border-2 border-rose-500 bg-rose-400/20 flex items-center justify-center shadow-inner transition-all duration-150"
                  style={{
                    width: `${Math.min(48, Math.max(14, eraserSize))}px`,
                    height: `${Math.min(48, Math.max(14, eraserSize))}px`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                </div>
              </div>

              {/* Eraser Thickness Presets */}
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                  Eraser Size
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { size: 14, label: 'Fine', sub: '14px' },
                    { size: 28, label: 'Medium', sub: '28px' },
                    { size: 48, label: 'Broad', sub: '48px' },
                  ].map((preset) => (
                    <button
                      key={preset.size}
                      onClick={() => onSelectEraserSize?.(preset.size)}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                        eraserSize === preset.size
                          ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-500/20'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="font-bold">{preset.label}</span>
                      <span className="text-[9px] opacity-70 font-normal">{preset.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrubbing Tip */}
              <div className="text-[11px] text-stone-600 bg-amber-50/90 border border-amber-200/70 rounded-xl p-2 flex items-start gap-1.5 leading-relaxed">
                <span className="text-amber-600 font-bold shrink-0">💡 Tip:</span>
                <span>Click & drag / scrub across strokes & shapes to erase them smoothly!</span>
              </div>

              {/* Clear Canvas Action */}
              {onClearCanvas && (
                <button
                  onClick={() => {
                    setShowEraserMenu(false);
                    onClearCanvas();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all shadow-sm"
                >
                  <Trash2 size={13} />
                  Clear Slide Clean
                </button>
              )}
            </div>
          )}
        </div>

        <div className="w-[1px] h-6 bg-stone-200 mx-0.5" />

        {/* Paper Texture Button */}
        <div className="relative">
          <button
            title="Napkin Paper Background"
            onClick={() => setShowTextureMenu(!showTextureMenu)}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 flex items-center gap-1"
          >
            <Palette size={16} />
          </button>
          {showTextureMenu && (
            <div className="absolute top-12 right-0 w-44 bg-white border border-stone-200 rounded-xl shadow-2xl p-2 flex flex-col gap-1 z-30">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
                Paper Style
              </span>
              {TEXTURE_LIST.map((t) => (
                <button
                  key={t.type}
                  onClick={() => {
                    onSelectPaperTexture(t.type);
                    setShowTextureMenu(false);
                  }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    paperTexture === t.type
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full border ${t.previewClass}`} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Digital Pen / Tablet Studio Button */}
        {onOpenStylusSettings && (
          <button
            title="Digital Pen & Tablet Studio (Stylus, Pressure, Palm Rejection)"
            onClick={onOpenStylusSettings}
            className={`p-2 rounded-xl transition-all relative flex items-center justify-center ${
              isStylusActive
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100/80 shadow-sm'
                : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <Tablet size={16} />
            {isStylusActive && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            )}
          </button>
        )}
      </div>

      {/* Secondary Context Toolbar (Tailored per active tool & selection context) */}
      {currentTool === 'eraser' ? (
        /* ERASER CONTEXT BAR */
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-full shadow-lg shadow-stone-900/5 text-stone-600 text-xs animate-in fade-in duration-100 select-none">
          {/* Active Tool Badge */}
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-stone-200">
            <span className="font-bold text-[11px] text-rose-600 font-['Outfit'] flex items-center gap-1">
              <Eraser size={14} />
              Napkin Eraser
            </span>
          </div>

          {/* Eraser Size Presets */}
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Size:</span>
            {[
              { size: 14, label: 'Fine (14px)' },
              { size: 28, label: 'Medium (28px)' },
              { size: 48, label: 'Broad (48px)' },
            ].map((p) => (
              <button
                key={p.size}
                onClick={() => onSelectEraserSize?.(p.size)}
                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all ${
                  eraserSize === p.size
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Quick Clear Slide */}
          {onClearCanvas && (
            <button
              onClick={onClearCanvas}
              title="Wipe current slide drawings & notes clean"
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 transition-colors"
            >
              <Trash2 size={12} />
              <span>Clear Slide</span>
            </button>
          )}

          {/* Tip */}
          <span className="text-[11px] text-stone-400 italic hidden sm:inline pl-1">
            Drag across ink or shapes to erase
          </span>
        </div>
      ) : currentTool === 'select' ? (
        /* SELECT & INSPECT CONTEXT BAR */
        selectedElement ? (
          /* Selection Sub-state A: Element is actively selected */
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-full shadow-lg shadow-stone-900/5 text-stone-600 text-xs animate-in fade-in duration-100 select-none">
            {/* Selected Element Header */}
            <div className="flex items-center gap-1.5 pr-2.5 border-r border-stone-200">
              <span className="font-bold text-[11px] text-blue-600 font-['Outfit'] flex items-center gap-1.5">
                <MousePointer size={12} />
                <span className="capitalize">
                  {selectedElement.type === 'shape'
                    ? `${selectedElement.shapeType} Shape`
                    : selectedElement.type === 'stroke'
                    ? 'Pen Stroke'
                    : selectedElement.type === 'text'
                    ? 'Text'
                    : selectedElement.type === 'model'
                    ? selectedElement.title
                    : selectedElement.type === 'stamp'
                    ? `Stamp (${selectedElement.label || 'Icon'})`
                    : 'Element'}
                </span>
              </span>
            </div>

            {/* Quick Color Swatches if element supports color */}
            {'color' in selectedElement && (
              <div className="flex items-center gap-1 pr-2.5 border-r border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-0.5">Color:</span>
                {COLOR_PALETTE.slice(0, 8).map((c) => (
                  <button
                    key={c.hex}
                    title={c.name}
                    onClick={() => {
                      onSelectColor(c.hex);
                      onUpdateElement?.({ ...selectedElement, color: c.hex });
                    }}
                    className={`w-5 h-5 rounded-full border transition-transform shrink-0 flex items-center justify-center ${
                      selectedElement.color === c.hex ? 'scale-110 ring-2 ring-blue-500 ring-offset-1 z-10' : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: c.hex,
                      borderColor: c.hex === '#ffffff' ? '#cbd5e1' : 'rgba(0,0,0,0.15)',
                    }}
                  >
                    {selectedElement.color === c.hex && (
                      <span className={`text-[9px] font-bold ${c.hex === '#ffffff' || c.hex === '#f59e0b' ? 'text-stone-900' : 'text-white'}`}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
                {/* Custom Pipette */}
                <label
                  title="Pick custom color"
                  className="relative w-5 h-5 rounded-full border border-stone-300 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 bg-gradient-to-tr from-rose-400 via-amber-400 to-blue-500 shadow-sm shrink-0 overflow-hidden"
                >
                  <Pipette size={10} className="text-white drop-shadow-sm pointer-events-none z-10" />
                  <input
                    type="color"
                    value={'color' in selectedElement ? selectedElement.color : currentColor}
                    onChange={(e) => {
                      onSelectColor(e.target.value);
                      onUpdateElement?.({ ...selectedElement, color: e.target.value });
                    }}
                    className="sr-only"
                    style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                </label>
              </div>
            )}

            {/* Quick Stroke Width Presets (Shapes & Strokes) */}
            {(selectedElement.type === 'shape' || selectedElement.type === 'stroke') && (
              <div className="flex items-center gap-1 pr-2.5 border-r border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Size:</span>
                {[1, 2, 4, 8, 12].map((w) => {
                  const currentW = selectedElement.type === 'shape' ? selectedElement.strokeWidth : selectedElement.width;
                  return (
                    <button
                      key={w}
                      title={`Stroke: ${w}px`}
                      onClick={() => {
                        onSelectStrokeWidth(w);
                        if (selectedElement.type === 'shape') {
                          onUpdateElement?.({ ...selectedElement, strokeWidth: w });
                        } else if (selectedElement.type === 'stroke') {
                          onUpdateElement?.({ ...selectedElement, width: w });
                        }
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        currentW === w
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div
                        className="rounded-full bg-current shrink-0"
                        style={{ width: `${Math.min(13, Math.max(3, w * 1.2))}px`, height: `${Math.min(13, Math.max(3, w * 1.2))}px` }}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Font Size Presets (Text) */}
            {selectedElement.type === 'text' && (
              <div className="flex items-center gap-1 pr-2.5 border-r border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Font:</span>
                {[16, 22, 32, 44].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => onUpdateElement?.({ ...selectedElement, fontSize: sz })}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                      selectedElement.fontSize === sz
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            )}

            {/* Element Actions: Duplicate, Layer, Delete */}
            <div className="flex items-center gap-1">
              {onDuplicateElement && (
                <button
                  title="Duplicate (Ctrl+D)"
                  onClick={() => onDuplicateElement(selectedElement.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium text-[11px] transition-colors"
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
              )}
              {onBringToFront && (
                <button
                  title="Bring to Front"
                  onClick={() => onBringToFront(selectedElement.id)}
                  className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <ArrowUp size={13} />
                </button>
              )}
              {onSendToBack && (
                <button
                  title="Send to Back"
                  onClick={() => onSendToBack(selectedElement.id)}
                  className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <ArrowDown size={13} />
                </button>
              )}
              {onDeleteElement && (
                <button
                  title="Delete (Del / Backspace)"
                  onClick={() => onDeleteElement(selectedElement.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-medium text-[11px] transition-colors ml-0.5"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Selection Sub-state B: No element selected */
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-full shadow-lg shadow-stone-900/5 text-stone-600 text-xs animate-in fade-in duration-100 select-none">
            <div className="flex items-center gap-1.5 pr-2.5 border-r border-stone-200">
              <span className="font-bold text-[11px] text-blue-600 font-['Outfit'] flex items-center gap-1">
                <MousePointer size={13} />
                Select Mode
              </span>
            </div>
            <span className="text-[11px] text-stone-500">
              Click any element to edit & style · Drag canvas to pan
            </span>
            <div className="w-[1px] h-3.5 bg-stone-200 mx-0.5" />
            <button
              onClick={() => onSelectTool('pen')}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors"
            >
              <PenTool size={11} />
              <span>Draw (P)</span>
            </button>
            {hasCanvasElements && onClearCanvas && (
              <button
                onClick={onClearCanvas}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-rose-600 hover:bg-rose-50 font-medium text-[11px] transition-colors"
              >
                <Trash2 size={11} />
                <span>Clear Slide</span>
              </button>
            )}
          </div>
        )
      ) : currentTool === 'shape' ? (
        /* SHAPE TOOL CONTEXT BAR */
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-full shadow-lg shadow-stone-900/5 text-stone-600 text-xs animate-in fade-in duration-100 select-none">
          {/* Active Shape Selector */}
          <div className="relative">
            <button
              title="Select Shape: Rectangle, Circle, Arrow, Diamond..."
              onClick={() => setShowContextShapeMenu(!isContextShapeMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] font-['Outfit'] hover:bg-blue-100 transition-colors border border-blue-200"
            >
              {SHAPES_LIST.find((s) => s.type === currentShapeType)?.icon || <Square size={13} />}
              <span className="capitalize">{SHAPES_LIST.find((s) => s.type === currentShapeType)?.label.split(' ')[0] || currentShapeType}</span>
              <ChevronDown size={11} className={`transition-transform opacity-70 ${isContextShapeMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isContextShapeMenuOpen && (
              <div className="absolute top-10 left-0 w-60 bg-white border border-stone-200/90 rounded-2xl shadow-2xl p-2 grid grid-cols-2 gap-1.5 z-50 animate-in fade-in duration-100">
                {SHAPES_LIST.map((s) => (
                  <button
                    key={s.type}
                    onClick={() => {
                      onSelectShapeType(s.type);
                      setShowContextShapeMenu(false);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-left transition-all ${
                      currentShapeType === s.type
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'hover:bg-stone-50 text-stone-700 border border-transparent'
                    }`}
                  >
                    <span className={currentShapeType === s.type ? 'text-blue-600' : 'text-stone-500'}>
                      {s.icon}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-[1px] h-4 bg-stone-200 mx-0.5" />

          {/* Color Palette */}
          <div className="flex items-center gap-1 pr-2.5 border-r border-stone-200">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                title={c.name}
                onClick={() => onSelectColor(c.hex)}
                className={`w-5 h-5 rounded-full border transition-transform shrink-0 flex items-center justify-center ${
                  currentColor === c.hex ? 'scale-115 ring-2 ring-blue-500 ring-offset-1 z-10' : 'hover:scale-110'
                }`}
                style={{
                  backgroundColor: c.hex,
                  borderColor: c.hex === '#ffffff' ? '#cbd5e1' : 'rgba(0,0,0,0.15)',
                }}
              >
                {currentColor === c.hex && (
                  <span className={`text-[9px] font-bold ${c.hex === '#ffffff' || c.hex === '#f59e0b' ? 'text-stone-900' : 'text-white'}`}>
                    ✓
                  </span>
                )}
              </button>
            ))}
            {/* Custom Pipette */}
            <label
              title="Choose custom color"
              className="relative w-5 h-5 rounded-full border border-stone-300 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 bg-gradient-to-tr from-rose-400 via-amber-400 to-blue-500 shadow-sm shrink-0 overflow-hidden"
            >
              <Pipette size={10} className="text-white drop-shadow-sm pointer-events-none z-10" />
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onSelectColor(e.target.value)}
                className="sr-only"
                style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Stroke Width Presets */}
          <div className="flex items-center gap-1 pr-2.5 border-r border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-0.5">Size:</span>
            {[1, 2, 4, 8, 12].map((w) => (
              <button
                key={w}
                title={`Stroke: ${w}px`}
                onClick={() => onSelectStrokeWidth(w)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  strokeWidth === w
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div
                  className="rounded-full bg-current shrink-0"
                  style={{ width: `${Math.min(13, Math.max(3, w * 1.2))}px`, height: `${Math.min(13, Math.max(3, w * 1.2))}px` }}
                />
              </button>
            ))}
            <span className="font-bold text-[11px] text-blue-600 min-w-[24px] text-center font-['Outfit']">
              {strokeWidth}px
            </span>
          </div>

          {/* Napkin Sketch Toggle */}
          <button
            onClick={onToggleRough}
            title="Toggle hand-drawn sketchy wobble"
            className={`px-2.5 py-1 rounded-full font-semibold transition-colors text-[11px] ${
              isRough
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {isRough ? '✏️ Napkin Sketch' : '📐 Clean Vector'}
          </button>
        </div>
      ) : currentTool === 'text' ? (
        /* TEXT TOOL CONTEXT BAR */
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-full shadow-lg shadow-stone-900/5 text-stone-600 text-xs animate-in fade-in duration-100 select-none">
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-stone-200">
            <span className="font-bold text-[11px] text-blue-600 font-['Outfit'] flex items-center gap-1">
              <Type size={13} />
              Handwriting Text
            </span>
          </div>
          {/* Quick Font Size Presets */}
          <div className="flex items-center gap-1 pr-2.5 border-r border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-0.5">Size:</span>
            {[
              { label: 'Note', size: 16 },
              { label: 'Body', size: 22 },
              { label: 'Title', size: 32 },
              { label: 'Hero', size: 44 },
            ].map((p) => (
              <button
                key={p.size}
                onClick={() => onSelectStrokeWidth(p.size === 16 ? 1 : p.size === 22 ? 2 : p.size === 32 ? 4 : 8)}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold hover:bg-stone-100 text-stone-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Text Colors */}
          <div className="flex items-center gap-1 pr-2.5 border-r border-stone-200">
            {COLOR_PALETTE.slice(0, 7).map((c) => (
              <button
                key={c.hex}
                title={c.name}
                onClick={() => onSelectColor(c.hex)}
                className={`w-5 h-5 rounded-full border transition-transform shrink-0 flex items-center justify-center ${
                  currentColor === c.hex ? 'scale-115 ring-2 ring-blue-500 ring-offset-1 z-10' : 'hover:scale-110'
                }`}
                style={{
                  backgroundColor: c.hex,
                  borderColor: c.hex === '#ffffff' ? '#cbd5e1' : 'rgba(0,0,0,0.15)',
                }}
              >
                {currentColor === c.hex && (
                  <span className={`text-[9px] font-bold ${c.hex === '#ffffff' || c.hex === '#f59e0b' ? 'text-stone-900' : 'text-white'}`}>
                    ✓
                  </span>
                )}
              </button>
            ))}
            {/* Pipette */}
            <label
              title="Choose custom text color"
              className="relative w-5 h-5 rounded-full border border-stone-300 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 bg-gradient-to-tr from-rose-400 via-amber-400 to-blue-500 shadow-sm shrink-0 overflow-hidden"
            >
              <Pipette size={10} className="text-white drop-shadow-sm pointer-events-none z-10" />
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onSelectColor(e.target.value)}
                className="sr-only"
                style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </label>
          </div>
          <span className="text-[11px] text-stone-400 italic">
            Click anywhere on napkin to write
          </span>
        </div>
      ) : (
        /* PEN, HIGHLIGHTER, SMART DRAW DEFAULT CONTEXT BAR */
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-full shadow-lg shadow-stone-900/5 text-stone-600 text-xs animate-in fade-in duration-100 select-none">
          {/* Active Tool Badge with Live Stroke Swatch */}
          <div className="flex items-center gap-1.5 pl-1 pr-2.5 border-r border-stone-200">
            <span className="font-bold text-[11px] text-stone-800 font-['Outfit'] flex items-center gap-1">
              {currentTool === 'pen' && <PenTool size={13} className="text-blue-600" />}
              {currentTool === 'highlighter' && <Highlighter size={13} className="text-amber-500" />}
              {currentTool === 'smart' && <Wand2 size={13} className="text-violet-600" />}
              <span>{currentTool === 'pen' ? 'Felt Pen' : currentTool === 'highlighter' ? 'Highlighter' : 'Smart Draw'}</span>
            </span>
            {/* Live mini stroke preview chip */}
            <div
              className="w-5 rounded-full shadow-sm shrink-0"
              style={{
                backgroundColor: currentColor,
                height: `${Math.min(14, Math.max(2, strokeWidth))}px`,
              }}
            />
          </div>

          {/* Colors Palette & Custom Picker */}
          <div className="flex items-center gap-1 pr-2.5 border-r border-stone-200">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                title={c.name}
                onClick={() => onSelectColor(c.hex)}
                className={`w-5 h-5 rounded-full border transition-transform shrink-0 flex items-center justify-center ${
                  currentColor === c.hex ? 'scale-115 ring-2 ring-blue-500 ring-offset-1 z-10' : 'hover:scale-110'
                }`}
                style={{
                  backgroundColor: c.hex,
                  borderColor: c.hex === '#ffffff' ? '#cbd5e1' : 'rgba(0,0,0,0.15)',
                }}
              >
                {currentColor === c.hex && (
                  <span className={`text-[9px] font-bold ${c.hex === '#ffffff' || c.hex === '#f59e0b' ? 'text-stone-900' : 'text-white'}`}>
                    ✓
                  </span>
                )}
              </button>
            ))}
            {/* Custom Color Pipette Button */}
            <label
              title="Choose custom color"
              className="relative w-5 h-5 rounded-full border border-stone-300 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 bg-gradient-to-tr from-rose-400 via-amber-400 to-blue-500 shadow-sm shrink-0 overflow-hidden"
            >
              <Pipette size={10} className="text-white drop-shadow-sm pointer-events-none z-10" />
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onSelectColor(e.target.value)}
                className="sr-only"
                style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Thickness Presets & Indicator */}
          <div className="flex items-center gap-1 pr-2.5 border-r border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-0.5">Size:</span>
            {[1, 2, 4, 8, 12, 16].map((w) => (
              <button
                key={w}
                title={`Pen Stroke: ${w}px`}
                onClick={() => onSelectStrokeWidth(w)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  strokeWidth === w
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div
                  className="rounded-full bg-current shrink-0"
                  style={{ width: `${Math.min(13, Math.max(3, w * 1.2))}px`, height: `${Math.min(13, Math.max(3, w * 1.2))}px` }}
                />
              </button>
            ))}
            {/* Stepper controls */}
            <div className="flex items-center gap-0.5 ml-1">
              <button
                title="Decrease stroke width"
                onClick={() => onSelectStrokeWidth(Math.max(1, strokeWidth - 1))}
                className="w-4 h-5 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded text-xs font-bold"
              >
                -
              </button>
              <span className="font-bold text-[11px] text-blue-600 min-w-[24px] text-center font-['Outfit']">
                {strokeWidth}px
              </span>
              <button
                title="Increase stroke width"
                onClick={() => onSelectStrokeWidth(Math.min(24, strokeWidth + 1))}
                className="w-4 h-5 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Rough Napkin vs Clean Vector Toggle */}
          <button
            onClick={onToggleRough}
            title="Toggle hand-drawn sketchy wobble"
            className={`px-2.5 py-1 rounded-full font-semibold transition-colors text-[11px] ${
              isRough
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {isRough ? '✏️ Napkin Sketch' : '📐 Clean Vector'}
          </button>
        </div>
      )}
    </div>
  );
};
