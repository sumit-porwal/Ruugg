import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import rough from 'roughjs';
import type { Slide } from '../types';
import {
  renderBackground,
  renderConnector,
  renderModel,
  renderShape,
  renderStamp,
  renderStroke,
  renderText,
} from '../utils/canvasRenderer';

interface PresentationModeProps {
  slides: Slide[];
  initialSlideIndex: number;
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  initialSlideIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [showNotes, setShowNotes] = useState(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentSlide = slides[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < slides.length - 1 ? i + 1 : i));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose]);

  // Render slide on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentSlide) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed presentation resolution (1920x1080 scaled)
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Render background
    renderBackground(ctx, canvas.width, canvas.height, currentSlide.paperTexture);

    const rc = rough.canvas(canvas);

    // Render elements
    for (const el of currentSlide.elements) {
      if (el.type === 'stroke') {
        renderStroke(ctx, el);
      } else if (el.type === 'shape') {
        renderShape(ctx, rc, el);
      } else if (el.type === 'text') {
        renderText(ctx, el);
      } else if (el.type === 'model') {
        renderModel(ctx, rc, el);
      } else if (el.type === 'stamp') {
        renderStamp(ctx, rc, el);
      } else if (el.type === 'connector') {
        renderConnector(ctx, rc, el);
      }
    }
  }, [currentIndex, currentSlide]);

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-between overflow-hidden select-none"
      onMouseMove={(e) => setLaserPos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setLaserPos(null)}
    >
      {/* Laser pointer glow effect */}
      {laserPos && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: laserPos.x, top: laserPos.y }}
        >
          <div className="w-5 h-5 rounded-full bg-red-500/80 blur-xs animate-pulse ring-4 ring-red-400/30" />
        </div>
      )}

      {/* Top Presentation Bar */}
      <div className="w-full px-6 py-4 flex items-center justify-between bg-stone-900/60 backdrop-blur-md border-b border-stone-800 text-white z-40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40">
            Napkin {currentIndex + 1} of {slides.length}
          </span>
          <h2 className="text-base font-bold font-['Outfit'] truncate max-w-md">
            {currentSlide.title}
          </h2>
          {currentSlide.questionPrompt && (
            <span className="hidden sm:inline-block text-xs text-stone-400 font-['Patrick_Hand']">
              — "{currentSlide.questionPrompt}"
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentSlide.notes && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                showNotes ? 'bg-amber-500 text-stone-900' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <FileText size={14} />
              <span>Speaker Notes</span>
            </button>
          )}

          <button
            onClick={onClose}
            title="Exit Presentation (Esc)"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
          >
            <X size={15} />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Canvas Slide Screen */}
      <div className="flex-1 w-full flex items-center justify-center p-6 relative">
        <div className="w-full max-w-6xl h-full max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-800 relative">
          <canvas ref={canvasRef} className="w-full h-full block cursor-none" />
        </div>

        {/* Floating Notes Card if enabled */}
        {showNotes && currentSlide.notes && (
          <div className="absolute bottom-10 left-12 max-w-sm bg-amber-50/95 backdrop-blur-md border border-amber-300 rounded-2xl p-4 shadow-2xl text-stone-900 z-40 animate-in slide-in-from-bottom-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">
              📝 Visual Thinking Cue
            </div>
            <p className="text-sm font-['Patrick_Hand'] text-stone-800 leading-snug">
              {currentSlide.notes}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation Controls */}
      <div className="w-full px-6 py-4 flex items-center justify-center gap-4 bg-stone-900/60 backdrop-blur-md border-t border-stone-800 z-40">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 text-xs font-bold transition-all"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <span className="text-xs font-semibold text-stone-400">
          Slide {currentIndex + 1} / {slides.length}
        </span>

        <button
          onClick={goNext}
          disabled={currentIndex === slides.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
