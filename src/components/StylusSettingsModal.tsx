import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Tablet,
  X,
  RotateCcw,
  Check,
  Hand,
  Eraser,
  ShieldCheck,
  MousePointer,
  Activity,
  Sliders,
} from 'lucide-react';
import type { StylusSettings } from '../types';
import { DEFAULT_STYLUS_SETTINGS, applyPressureCurve } from '../utils/stylusManager';
import { renderPressureStroke } from '../utils/canvasRenderer';

interface StylusSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StylusSettings;
  onSaveSettings: (settings: StylusSettings) => void;
  liveStylusInfo?: {
    isConnected: boolean;
    livePressure: number;
    pointerType: string;
    tilt: { x: number; y: number };
  };
}

export const StylusSettingsModal: React.FC<StylusSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  liveStylusInfo,
}) => {
  const [localSettings, setLocalSettings] = useState<StylusSettings>(settings);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scratchStrokes, setScratchStrokes] = useState<
    { points: { x: number; y: number; pressure?: number }[]; color: string; width: number }[]
  >([]);
  const isScratchDrawingRef = useRef(false);
  const activeScratchPtsRef = useRef<{ x: number; y: number; pressure?: number }[]>([]);

  // Keep localSettings in sync when prop changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Redraw scratchpad test canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw warm napkin scratchpad background
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid dots
    ctx.fillStyle = '#e2dacf';
    for (let x = 14; x < canvas.width; x += 20) {
      for (let y = 14; y < canvas.height; y += 20) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // Render committed strokes
    for (const stroke of scratchStrokes) {
      renderPressureStroke(ctx, stroke.points, stroke.color, stroke.width);
    }

    // Render active stroke
    if (activeScratchPtsRef.current.length > 0) {
      renderPressureStroke(ctx, activeScratchPtsRef.current, '#2563eb', 4);
    }
  }, [isOpen, scratchStrokes]);

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof StylusSettings>(key: K, value: StylusSettings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleReset = () => {
    setLocalSettings({ ...DEFAULT_STYLUS_SETTINGS });
    onSaveSettings({ ...DEFAULT_STYLUS_SETTINGS });
  };

  // Scratchpad pointer event handlers
  const handleScratchPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isScratchDrawingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const rawPressure = e.pressure > 0 ? e.pressure : 0.5;
    const pressure = localSettings.pressureEnabled
      ? applyPressureCurve(rawPressure, localSettings.pressureCurve)
      : 0.5;

    activeScratchPtsRef.current = [{
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure,
    }];
  };

  const handleScratchPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratchDrawingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rawPressure = e.pressure > 0 ? e.pressure : 0.5;
    const pressure = localSettings.pressureEnabled
      ? applyPressureCurve(rawPressure, localSettings.pressureCurve)
      : 0.5;

    activeScratchPtsRef.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure,
    });

    // Immediate scratchpad redraw
    const canvas = scratchCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#faf8f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e2dacf';
        for (let x = 14; x < canvas.width; x += 20) {
          for (let y = 14; y < canvas.height; y += 20) {
            ctx.fillRect(x, y, 1.5, 1.5);
          }
        }
        for (const stroke of scratchStrokes) {
          renderPressureStroke(ctx, stroke.points, stroke.color, stroke.width);
        }
        if (activeScratchPtsRef.current.length > 0) {
          renderPressureStroke(ctx, activeScratchPtsRef.current, '#2563eb', 4);
        }
      }
    }
  };

  const handleScratchPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratchDrawingRef.current) return;
    isScratchDrawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (activeScratchPtsRef.current.length > 0) {
      setScratchStrokes((prev) => [
        ...prev,
        {
          points: [...activeScratchPtsRef.current],
          color: '#2563eb',
          width: 4,
        },
      ]);
      activeScratchPtsRef.current = [];
    }
  };

  const isConnected = liveStylusInfo?.isConnected ?? false;
  const currentPressurePercent = Math.round((liveStylusInfo?.livePressure ?? 0) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] my-auto animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <Tablet size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-['Outfit'] flex items-center gap-2">
                Digital Pen & Tablet Studio
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Stylus Engine
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                Precision inking, pressure dynamics & palm rejection for iPad, Surface, Wacom & Galaxy Tab
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0 text-stone-800">
          {/* Live Telemetry & Device Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                    isConnected
                      ? 'bg-blue-600/30 border-blue-400 text-blue-300 shadow-lg shadow-blue-500/20'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  <PenTool size={22} />
                </div>
                {isConnected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-900 rounded-full animate-ping" />
                )}
                {isConnected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-900 rounded-full" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-['Outfit']">
                    {isConnected ? 'Digital Pen / Stylus Active' : 'Waiting for Stylus Input'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-stone-800 text-stone-400 border border-stone-700'
                    }`}
                  >
                    {isConnected ? (liveStylusInfo?.pointerType?.toUpperCase() || 'PEN') : 'IDLE'}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isConnected
                    ? '120Hz Coalesced Sampling • Pressure & Tilt Active'
                    : 'Touch canvas with Apple Pencil, Surface Pen, or Wacom stylus'}
                </p>
              </div>
            </div>

            {/* Live Pressure Meter */}
            <div className="flex items-center gap-4 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Activity size={10} className="text-blue-400" />
                  Live Pressure
                </span>
                <span className="text-sm font-bold font-mono text-white">
                  {currentPressurePercent > 0 ? `${currentPressurePercent}%` : '0%'}
                </span>
              </div>
              {/* Dynamic pressure visual dot */}
              <div className="w-9 h-9 rounded-full bg-stone-950 flex items-center justify-center border border-white/15 overflow-hidden">
                <div
                  className="rounded-full bg-blue-500 transition-all duration-75"
                  style={{
                    width: `${Math.max(4, (currentPressurePercent / 100) * 32)}px`,
                    height: `${Math.max(4, (currentPressurePercent / 100) * 32)}px`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Test Scratchpad */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 font-['Outfit'] flex items-center gap-1.5">
                <PenTool size={13} className="text-blue-600" />
                Live Inking Scratchpad (Test Pressure & Feel)
              </label>
              <button
                onClick={() => setScratchStrokes([])}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium px-2 py-0.5 rounded hover:bg-stone-100 transition-colors"
              >
                Clear Pad
              </button>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-amber-200/90 shadow-sm cursor-crosshair">
              <canvas
                ref={scratchCanvasRef}
                width={590}
                height={120}
                onPointerDown={handleScratchPointerDown}
                onPointerMove={handleScratchPointerMove}
                onPointerUp={handleScratchPointerUp}
                onPointerCancel={handleScratchPointerUp}
                className="w-full h-28 block bg-[#faf8f5]"
                style={{ touchAction: 'none' }}
              />
              <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-semibold text-amber-800/40 uppercase tracking-widest font-['Outfit']">
                Doodle with Pen / Stylus
              </div>
            </div>
          </div>

          {/* Setting 1: Pressure Sensitivity */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-900 font-['Outfit'] flex items-center gap-1.5">
                  <Sliders size={14} className="text-blue-600" />
                  Pressure Sensitivity Dynamics
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  Modulate stroke thickness and ink saturation naturally based on pen tip force
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.pressureEnabled}
                  onChange={(e) => handleUpdate('pressureEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {localSettings.pressureEnabled && (
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-stone-600">Pressure Response Curve:</span>
                <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl">
                  {(['soft', 'normal', 'firm'] as const).map((curve) => (
                    <button
                      key={curve}
                      onClick={() => handleUpdate('pressureCurve', curve)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                        localSettings.pressureCurve === curve
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {curve}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Setting 2: Streamline / Jitter Stabilization */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-900 font-['Outfit'] flex items-center gap-1.5">
                  <Activity size={14} className="text-blue-600" />
                  Stroke Streamline & Jitter Stabilization
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  Eliminates micro-jitter and hand trembling on smooth glass tablet digitizers
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-stone-200/60 rounded-xl">
                {[
                  { label: 'Off', val: 0 },
                  { label: 'Natural (35%)', val: 0.35 },
                  { label: 'Smooth (65%)', val: 0.65 },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleUpdate('streamline', s.val)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      Math.abs(localSettings.streamline - s.val) < 0.05
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Setting 3: Smart Palm Rejection */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 font-['Outfit'] flex items-center gap-1.5">
                  Smart Palm Rejection
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  Rejects wide touch areas and accidental palm brushes when resting your hand on the tablet screen
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.palmRejection}
                onChange={(e) => handleUpdate('palmRejection', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Setting 4: Tablet Finger Navigation ("Stylus Inks, Finger Navigates") */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Hand size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 font-['Outfit']">
                  Tablet Touch Gesture Action
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  Choose what happens when touching the canvas with your finger
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleUpdate('fingerAction', 'pan')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  localSettings.fingerAction === 'pan'
                    ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-sm'
                    : 'bg-white border-stone-200/80 text-stone-700 hover:bg-stone-100/50'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs font-['Outfit']">
                  <span>🖐️ Finger Pans & Zooms (Recommended)</span>
                  {localSettings.fingerAction === 'pan' && <Check size={14} className="text-blue-600" />}
                </div>
                <span className="text-[11px] text-stone-500 leading-snug">
                  Only the digital pen draws ink; one or two fingers fluidly move & zoom the napkin without stray marks.
                </span>
              </button>

              <button
                onClick={() => handleUpdate('fingerAction', 'draw')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  localSettings.fingerAction === 'draw'
                    ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-sm'
                    : 'bg-white border-stone-200/80 text-stone-700 hover:bg-stone-100/50'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs font-['Outfit']">
                  <span>✏️ Finger Also Draws</span>
                  {localSettings.fingerAction === 'draw' && <Check size={14} className="text-blue-600" />}
                </div>
                <span className="text-[11px] text-stone-500 leading-snug">
                  Finger touches draw strokes just like a pen. Ideal when you don't have a stylus available.
                </span>
              </button>
            </div>
          </div>

          {/* Setting 5 & 6: Stylus Hardware Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Hardware Eraser Tip */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Eraser size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 font-['Outfit']">
                    Stylus Tail Eraser Tip
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Flip pen to automatically scrub and erase elements
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.hardwareEraserEnabled}
                  onChange={(e) => handleUpdate('hardwareEraserEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-rose-600" />
              </label>
            </div>

            {/* Barrel / Side Button Mapping */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <span className="text-xs font-bold text-stone-900 font-['Outfit'] flex items-center gap-1.5">
                <MousePointer size={14} className="text-blue-600" />
                Stylus Barrel / Side Button
              </span>
              <div className="flex items-center gap-1 p-1 bg-stone-200/60 rounded-xl">
                {[
                  { label: 'Erase', val: 'eraser' as const },
                  { label: 'Pan', val: 'pan' as const },
                  { label: 'Select', val: 'select' as const },
                ].map((b) => (
                  <button
                    key={b.val}
                    onClick={() => handleUpdate('barrelButtonAction', b.val)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                      localSettings.barrelButtonAction === b.val
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 text-xs font-semibold transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            Done & Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
