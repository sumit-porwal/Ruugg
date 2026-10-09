import React, { useState } from 'react';
import {
  Plus,
  Copy,
  Trash2,
  Presentation,
} from 'lucide-react';
import type { SixSliceType, Slide } from '../types';

interface SlideDeckProps {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (id: string) => void;
  onAddSlide: (sliceTag?: SixSliceType) => void;
  onDuplicateSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onUpdateSlideTitle: (id: string, title: string) => void;
  onStartPresentation: () => void;
}

const SLICE_COLORS: Record<SixSliceType, string> = {
  whoWhat: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  howMuch: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  where: 'bg-blue-100 text-blue-700 border-blue-200',
  when: 'bg-amber-100 text-amber-700 border-amber-200',
  how: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  why: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const SlideDeck: React.FC<SlideDeckProps> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onUpdateSlideTitle,
  onStartPresentation,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  const activeIndex = slides.findIndex((s) => s.id === activeSlideId);

  return (
    <div
      className={`absolute bottom-4 left-6 right-6 z-20 transition-all duration-300 pointer-events-auto ${
        isCollapsed ? 'translate-y-20' : 'translate-y-0'
      }`}
    >
      <div className="relative bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-xl shadow-stone-900/10 p-2.5 flex items-center gap-3">
        {/* Toggle Collapse Pill */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -top-7 right-4 bg-white/95 backdrop-blur-md border border-stone-200/90 px-3 py-1 rounded-t-xl text-[11px] font-bold text-stone-600 hover:text-stone-900 shadow-sm transition-all"
        >
          {isCollapsed ? '▲ Show Napkin Slides' : '▼ Hide Slides'}
        </button>

        {/* Slides Counter & Present Button */}
        <div className="flex items-center gap-2 pr-3 border-r border-stone-200">
          <button
            onClick={onStartPresentation}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Presentation size={15} />
            <span>Present</span>
          </button>
          <span className="text-xs font-semibold text-stone-500 min-w-[55px] text-center">
            {activeIndex + 1} / {slides.length}
          </span>
        </div>

        {/* Scrollable Slides Thumbnails */}
        <div className="flex-1 overflow-x-auto flex items-center gap-2.5 py-1 scrollbar-thin scrollbar-thumb-stone-200">
          {slides.map((slide, idx) => {
            const isActive = slide.id === activeSlideId;
            return (
              <div
                key={slide.id}
                onClick={() => onSelectSlide(slide.id)}
                className={`group relative flex-shrink-0 w-44 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                {/* Header row in thumbnail */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-stone-400">#{idx + 1}</span>
                  {slide.sliceTag && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                        SLICE_COLORS[slide.sliceTag] || 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {slide.sliceTag}
                    </span>
                  )}
                </div>

                {/* Title */}
                {editingTitleId === slide.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={() => {
                      if (tempTitle.trim()) onUpdateSlideTitle(slide.id, tempTitle.trim());
                      setEditingTitleId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (tempTitle.trim()) onUpdateSlideTitle(slide.id, tempTitle.trim());
                        setEditingTitleId(null);
                      }
                      if (e.key === 'Escape') setEditingTitleId(null);
                    }}
                    className="w-full text-xs font-bold text-stone-800 bg-white border border-blue-400 rounded px-1 py-0.5 outline-none"
                  />
                ) : (
                  <div
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingTitleId(slide.id);
                      setTempTitle(slide.title);
                    }}
                    title="Double click to rename"
                    className="text-xs font-bold text-stone-800 truncate"
                  >
                    {slide.title}
                  </div>
                )}

                {/* Elements Count / Prompt Cue */}
                <div className="text-[10px] text-stone-400 truncate mt-0.5">
                  {slide.elements.length} elements • {slide.paperTexture}
                </div>

                {/* Hover actions: Duplicate & Delete */}
                <div className="absolute top-1.5 right-1.5 hidden group-hover:flex items-center gap-0.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-stone-200 p-0.5">
                  <button
                    title="Duplicate Napkin"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(slide.id);
                    }}
                    className="p-1 hover:bg-stone-100 text-stone-500 rounded"
                  >
                    <Copy size={12} />
                  </button>
                  {slides.length > 1 && (
                    <button
                      title="Delete Napkin"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(slide.id);
                      }}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add New Slide Button */}
          <button
            onClick={() => onAddSlide()}
            className="flex-shrink-0 flex items-center justify-center gap-1.5 w-32 h-[72px] rounded-xl border-2 border-dashed border-stone-300 hover:border-blue-500 hover:bg-blue-50/50 text-stone-500 hover:text-blue-600 transition-all font-semibold text-xs"
          >
            <Plus size={16} />
            <span>Add Napkin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
