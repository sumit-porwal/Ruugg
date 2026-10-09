import React, { useState } from 'react';
import {
  Users,
  BarChart2,
  Compass,
  Clock,
  GitFork,
  HelpCircle,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import type { SixSliceType } from '../types';
import { SIX_SLICES_INFO } from '../utils/sixSlicesTemplates';

interface SixSlicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertModel: (kind: any, category: SixSliceType) => void;
  onCreateSliceSlide: (category: SixSliceType, title: string) => void;
}

export const SixSlicesModal: React.FC<SixSlicesModalProps> = ({
  isOpen,
  onClose,
  onInsertModel,
  onCreateSliceSlide,
}) => {
  const [selectedSlice, setSelectedSlice] = useState<SixSliceType>('where');

  if (!isOpen) return null;

  const currentSliceInfo = SIX_SLICES_INFO[selectedSlice];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-['Outfit']">
                Napkin Thinking: The 6 Slices & Models
              </h2>
              <p className="text-xs text-stone-500">
                Inspired by Dan Roam's Napkin Academy. Choose a slice to frame your visual problem.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Left Navigation: The 6 Slices */}
          <div className="w-full md:w-56 border-r border-stone-100 p-2 space-y-1 bg-stone-50/30 shrink-0">
            {(Object.keys(SIX_SLICES_INFO) as SixSliceType[]).map((sliceKey) => {
              const slice = SIX_SLICES_INFO[sliceKey];
              const isSelected = selectedSlice === sliceKey;
              return (
                <button
                  key={sliceKey}
                  onClick={() => setSelectedSlice(sliceKey)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : 'hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {sliceKey === 'whoWhat' && <Users size={14} />}
                    {sliceKey === 'howMuch' && <BarChart2 size={14} />}
                    {sliceKey === 'where' && <Compass size={14} />}
                    {sliceKey === 'when' && <Clock size={14} />}
                    {sliceKey === 'how' && <GitFork size={14} />}
                    {sliceKey === 'why' && <HelpCircle size={14} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">{slice.label}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-blue-100' : 'text-stone-400'
                      }`}
                    >
                      {slice.question}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          <div className="flex-1 p-4 sm:p-5 space-y-4">
            {/* Slice Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {currentSliceInfo.label}
                </span>
                <button
                  onClick={() => {
                    onCreateSliceSlide(selectedSlice, `Napkin: ${currentSliceInfo.label}`);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-colors"
                >
                  <Plus size={14} />
                  <span>Create Napkin Slide</span>
                </button>
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-['Outfit']">
                "{currentSliceInfo.question}"
              </h3>
              <p className="text-xs text-stone-600 mt-1">{currentSliceInfo.purpose}</p>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-100 text-xs text-blue-700 font-medium">
                <span className="font-bold">Suggested drawing tools:</span>
                <div className="flex gap-1.5">
                  {currentSliceInfo.suggestedTools.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-white/80 rounded-md border border-blue-200 text-blue-800 text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Native Charts & Models for this Slice */}
            <div>
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                Insertable Native Models & Charts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentSliceInfo.models.map((model) => (
                  <div
                    key={model.kind}
                    className="border border-stone-200 hover:border-blue-400 rounded-xl p-3 transition-all hover:shadow-md group flex flex-col justify-between bg-white"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-900 font-['Outfit'] text-xs">
                          {model.name}
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded">
                          Native Chart
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mb-2.5 leading-snug">{model.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        onInsertModel(model.kind, selectedSlice);
                        onClose();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-stone-50 group-hover:bg-blue-600 text-stone-700 group-hover:text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      <Plus size={13} />
                      <span>Insert into Current Slide</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dan Roam Tip */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
              <span className="text-base">💡</span>
              <div className="text-[11px] text-amber-900 leading-snug">
                <strong className="font-bold">Dan Roam's Rule:</strong> "The more human and imperfect
                the sketch, the more open people are to giving feedback and collaborating. Never aim for
                perfection—aim for clarity!"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
