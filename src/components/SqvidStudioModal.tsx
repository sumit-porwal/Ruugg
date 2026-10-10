import React, { useState } from 'react';
import {
  Compass,
  X,
  Sparkles,
  Columns,
  ArrowRight,
  Copy,
} from 'lucide-react';
import type { CanvasElement, ShapeElement, TextElement } from '../types';
import { createStickyNote } from '../utils/sixSlicesTemplates';
import { createConnector } from '../utils/frameworkRegistry';

interface SqvidStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyElements: (elements: CanvasElement[], asNewSlide: boolean, title: string) => void;
  initialTopic?: string;
}

export const SqvidStudioModal: React.FC<SqvidStudioModalProps> = ({
  isOpen,
  onClose,
  onApplyElements,
  initialTopic = 'Product Experience Innovation',
}) => {
  const [topic, setTopic] = useState(initialTopic);

  // 5 SQVID spectrum sliders (0 = Left dimension, 100 = Right dimension)
  const [simpleDetailed, setSimpleDetailed] = useState(30);       // 0: Simple, 100: Detailed
  const [qualQuant, setQualQuant] = useState(40);                 // 0: Qualitative, 100: Quantitative
  const [visionReality, setVisionReality] = useState(50);         // 0: Reality, 100: Vision
  const [individualCompare, setIndividualCompare] = useState(50); // 0: Individual, 100: Comparison
  const [deltaSimilar, setDeltaSimilar] = useState(70);           // 0: Similarities, 100: Delta (Change)

  const [compareMode, setCompareMode] = useState(false);
  const [selectedAlt, setSelectedAlt] = useState<'A' | 'B'>('A');

  if (!isOpen) return null;

  // Generate real distinct visual elements based on the SQVID settings!
  const generateRepresentation = (
    s: number,
    q: number,
    v: number,
    i: number,
    d: number,
    prefix = 'sqvid'
  ): { title: string; elements: CanvasElement[]; summary: string } => {
    const isSimple = s < 50;
    const isQual = q < 50;
    const isReality = v < 50;
    const isIndividual = i < 50;
    const isDelta = d >= 50;

    const elements: CanvasElement[] = [];

    const labelS = isSimple ? 'Simple Sketch' : 'Detailed Schematic';
    const labelQ = isQual ? 'Qualitative / Human' : 'Quantitative / Metric';
    const labelV = isReality ? 'Present Reality' : 'Future Vision';
    const labelI = isIndividual ? 'Single Hero Focus' : 'Comparison Shootout';
    const labelD = isDelta ? 'Transformation Delta' : 'Preserved Continuity';

    const title = `${topic} (${labelS} • ${labelQ})`;

    // Title on canvas
    elements.push({
      id: `${prefix}_title`,
      type: 'text',
      x: 60,
      y: 50,
      text: title,
      fontSize: 26,
      color: '#0f172a',
      fontFamily: 'Kalam',
    } as TextElement);

    if (isSimple) {
      // SIMPLE REPRESENTATION: Clean, minimalist visual anchor
      elements.push({
        id: `${prefix}_hero_shape`,
        type: 'shape',
        shapeType: 'circle',
        x: 100,
        y: 160,
        width: 170,
        height: 170,
        color: '#2563eb',
        fillColor: '#eff6ff',
        strokeWidth: 3,
        isRough: true,
        text: topic,
        fontSize: 16,
        tag: 'hypothesis',
      } as ShapeElement);

      if (isQual) {
        // Simple + Qualitative: User story sticky & feeling
        elements.push(
          createStickyNote(
            340,
            160,
            `Human Experience:\n"This removed the friction instantly and made my day effortless."`,
            'User Sentiment',
            '#ecfdf5',
            '#059669'
          )
        );
      } else {
        // Simple + Quantitative: Bold single key metric
        elements.push({
          id: `${prefix}_metric_card`,
          type: 'shape',
          shapeType: 'rect',
          x: 340,
          y: 160,
          width: 200,
          height: 120,
          color: '#059669',
          fillColor: '#f0fdf4',
          strokeWidth: 2,
          isRough: true,
          text: '3.8x\nFaster Completion',
          fontSize: 22,
          tag: 'fact',
        } as ShapeElement);
      }

      if (isDelta) {
        elements.push(
          createStickyNote(
            580,
            160,
            'Delta (Before vs After):\n• Before: 45 min manual churn\n• After: 3 min automated flow',
            'Transformation',
            '#fef9c3',
            '#d97706'
          )
        );
      }
    } else {
      // DETAILED REPRESENTATION: Multi-node interconnected pipeline
      const n1 = `${prefix}_n1`;
      const n2 = `${prefix}_n2`;
      const n3 = `${prefix}_n3`;
      const n4 = `${prefix}_n4`;

      elements.push({
        id: n1,
        type: 'shape',
        shapeType: 'rect',
        x: 60,
        y: 160,
        width: 160,
        height: 80,
        color: '#1d4ed8',
        fillColor: '#eff6ff',
        strokeWidth: 2,
        isRough: true,
        text: '1. Inbound Ingestion\n(Webhook / API)',
        fontSize: 13,
        tag: 'fact',
      } as ShapeElement);

      elements.push({
        id: n2,
        type: 'shape',
        shapeType: 'diamond',
        x: 270,
        y: 135,
        width: 150,
        height: 130,
        color: '#7c3aed',
        fillColor: '#f5f3ff',
        strokeWidth: 2,
        isRough: true,
        text: 'Transform &\nClassify',
        fontSize: 13,
        tag: 'hypothesis',
      } as ShapeElement);

      elements.push({
        id: n3,
        type: 'shape',
        shapeType: 'rect',
        x: 470,
        y: 160,
        width: 170,
        height: 80,
        color: '#047857',
        fillColor: '#ecfdf5',
        strokeWidth: 2,
        isRough: true,
        text: '3. Real-Time Engine\n(Latency < 80ms)',
        fontSize: 13,
        tag: 'action',
      } as ShapeElement);

      elements.push({
        id: n4,
        type: 'shape',
        shapeType: 'rect',
        x: 690,
        y: 160,
        width: 160,
        height: 80,
        color: '#c2410c',
        fillColor: '#fff7ed',
        strokeWidth: 2,
        isRough: true,
        text: '4. Output Delivery\n(Client Sync)',
        fontSize: 13,
        tag: 'decision',
      } as ShapeElement);

      elements.push(createConnector(n1, n2, { x: 220, y: 200 }, { x: 270, y: 200 }));
      elements.push(createConnector(n2, n3, { x: 420, y: 200 }, { x: 470, y: 200 }));
      elements.push(createConnector(n3, n4, { x: 640, y: 200 }, { x: 690, y: 200 }));

      if (isIndividual) {
        elements.push(
          createStickyNote(
            60,
            330,
            `Hero Persona: End User\n• Primary Pain: Context switching\n• Desired Value: One-click resolution`,
            'User Profile',
            '#e0e7ff',
            '#4338ca'
          )
        );
      } else {
        // Comparison Shootout
        elements.push(
          createStickyNote(
            60,
            330,
            `Shootout:\n• Our Approach: Real-time, zero ops\n• Competitor: Batch overnight sync`,
            'Comparison',
            '#fee2e2',
            '#b91c1c'
          )
        );
      }

      if (isReality) {
        elements.push(
          createStickyNote(
            470,
            330,
            `Present Reality Constraints:\n• Legacy DB query limits\n• 3 engineer weeks budget`,
            'Constraints',
            '#fef3c7',
            '#b45309'
          )
        );
      } else {
        elements.push(
          createStickyNote(
            470,
            330,
            `Future Vision (2028):\n• Autonomous self-optimizing system\n• 100M events/day capability`,
            'Vision State',
            '#dbeafe',
            '#1e40af'
          )
        );
      }
    }

    const summary = `${labelS} representation with ${labelQ.toLowerCase()} emphasis (${labelI.toLowerCase()}), highlighting ${labelV.toLowerCase()} and ${labelD.toLowerCase()}.`;

    return { title, elements, summary };
  };

  // Alternative A (Current Slider Settings)
  const repA = generateRepresentation(
    simpleDetailed,
    qualQuant,
    visionReality,
    individualCompare,
    deltaSimilar,
    'sqvid_a'
  );

  // Alternative B (Contrasting Settings)
  const repB = generateRepresentation(
    100 - simpleDetailed,
    100 - qualQuant,
    100 - visionReality,
    100 - individualCompare,
    100 - deltaSimilar,
    'sqvid_b'
  );

  const handleApply = (asNewSlide: boolean) => {
    const chosen = selectedAlt === 'A' ? repA : repB;
    onApplyElements(chosen.elements, asNewSlide, chosen.title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200/90 w-full max-w-4xl h-[600px] max-h-[calc(100vh-2rem)] sm:max-h-[88vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="shrink-0 px-5 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Compass size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-sans tracking-tight">
                SQVID Exploration Studio
              </h2>
              <p className="text-[11px] text-stone-500">
                Explore 5 contrasting visual angles of your idea to find the most persuasive form.
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

        {/* Topic Input Bar */}
        <div className="shrink-0 px-5 py-2.5 bg-white border-b border-stone-100 flex items-center gap-2.5">
          <span className="text-xs font-semibold text-stone-500 font-sans shrink-0">
            Core Idea:
          </span>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 text-xs font-medium px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-sans text-stone-800"
            placeholder="e.g. Real-Time Customer Voice Translation"
          />
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
              compareMode
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm font-semibold'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            <Columns size={13} />
            <span>{compareMode ? 'Single View' : 'Compare Sides'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
          {/* Left Column: 5 SQVID Dimension Sliders */}
          <div className="w-56 sm:w-64 border-r border-stone-100 p-2.5 space-y-1.5 overflow-y-auto bg-stone-50/40 shrink-0 min-h-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block font-sans px-1">
              5 SQVID Levers
            </span>

            {/* S: Simple vs Detailed */}
            <div className="space-y-1 p-2 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-bold font-sans">
                <span className={simpleDetailed < 50 ? 'text-purple-600' : 'text-stone-400'}>
                  Simple (Napkin)
                </span>
                <span className={simpleDetailed >= 50 ? 'text-purple-600' : 'text-stone-400'}>
                  Detailed (System)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simpleDetailed}
                onChange={(e) => setSimpleDetailed(Number(e.target.value))}
                className="w-full accent-purple-600 h-1.5"
              />
              <p className="text-[10px] text-stone-400 leading-tight">
                {simpleDetailed < 50
                  ? 'Core visual hook graspable in 5 seconds.'
                  : 'Fleshed-out technical flow with interconnected nodes.'}
              </p>
            </div>

            {/* Q: Qualitative vs Quantitative */}
            <div className="space-y-1 p-2 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-bold font-sans">
                <span className={qualQuant < 50 ? 'text-emerald-600' : 'text-stone-400'}>
                  Qualitative (Heart)
                </span>
                <span className={qualQuant >= 50 ? 'text-emerald-600' : 'text-stone-400'}>
                  Quantitative (Data)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={qualQuant}
                onChange={(e) => setQualQuant(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5"
              />
              <p className="text-[10px] text-stone-400 leading-tight">
                {qualQuant < 50
                  ? 'Emphasizes human emotion and intuitive feel.'
                  : 'Emphasizes measurable metrics, speeds, and ROI.'}
              </p>
            </div>

            {/* V: Vision vs Reality */}
            <div className="space-y-1 p-2 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-bold font-sans">
                <span className={visionReality < 50 ? 'text-amber-600' : 'text-stone-400'}>
                  Present Reality
                </span>
                <span className={visionReality >= 50 ? 'text-amber-600' : 'text-stone-400'}>
                  Future Vision
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={visionReality}
                onChange={(e) => setVisionReality(Number(e.target.value))}
                className="w-full accent-amber-600 h-1.5"
              />
              <p className="text-[10px] text-stone-400 leading-tight">
                {visionReality < 50
                  ? 'Grounds in current bottlenecks and reality.'
                  : 'Paints the aspirational long-term horizon.'}
              </p>
            </div>

            {/* I: Individual vs Comparison */}
            <div className="space-y-1 p-2 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-bold font-sans">
                <span className={individualCompare < 50 ? 'text-blue-600' : 'text-stone-400'}>
                  Individual Focus
                </span>
                <span className={individualCompare >= 50 ? 'text-blue-600' : 'text-stone-400'}>
                  Comparison
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={individualCompare}
                onChange={(e) => setIndividualCompare(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5"
              />
              <p className="text-[10px] text-stone-400 leading-tight">
                {individualCompare < 50
                  ? 'Deep-dive on single persona in isolation.'
                  : 'Head-to-head comparison of alternatives.'}
              </p>
            </div>

            {/* D: Delta vs Similarities */}
            <div className="space-y-1 p-2 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-bold font-sans">
                <span className={deltaSimilar < 50 ? 'text-rose-600' : 'text-stone-400'}>
                  Continuity (Same)
                </span>
                <span className={deltaSimilar >= 50 ? 'text-rose-600' : 'text-stone-400'}>
                  Delta (Change)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={deltaSimilar}
                onChange={(e) => setDeltaSimilar(Number(e.target.value))}
                className="w-full accent-rose-600 h-1.5"
              />
              <p className="text-[10px] text-stone-400 leading-tight">
                {deltaSimilar >= 50
                  ? 'Dramatic Before vs After transformation.'
                  : 'Shows what stays steady and familiar.'}
              </p>
            </div>
          </div>

          {/* Right Column: Visual Representation Preview */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-stone-50/50 flex flex-col justify-between">
            {compareMode ? (
              /* Side-by-Side Comparison */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                {/* Alternative A Card */}
                <div
                  onClick={() => setSelectedAlt('A')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedAlt === 'A'
                      ? 'bg-white border-purple-600 ring-1 ring-purple-500/30 shadow-sm'
                      : 'bg-white/80 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2.5">
                      <span className="text-xs font-bold text-purple-700 font-sans flex items-center gap-1.5">
                        <Sparkles size={13} />
                        Alternative A (Current Sliders)
                      </span>
                      {selectedAlt === 'A' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 min-h-[120px] space-y-1.5">
                      <div className="text-xs font-bold text-stone-800 font-sans">{repA.title}</div>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans">
                        {repA.summary}
                      </p>
                      <div className="text-[10px] text-stone-400">
                        {repA.elements.length} diagram elements generated
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alternative B Card (Opposite Contrast) */}
                <div
                  onClick={() => setSelectedAlt('B')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedAlt === 'B'
                      ? 'bg-white border-purple-600 ring-1 ring-purple-500/30 shadow-sm'
                      : 'bg-white/80 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2.5">
                      <span className="text-xs font-bold text-stone-700 font-sans flex items-center gap-1.5">
                        <Compass size={13} />
                        Alternative B (Opposite Contrast)
                      </span>
                      {selectedAlt === 'B' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 min-h-[120px] space-y-1.5">
                      <div className="text-xs font-bold text-stone-800 font-sans">{repB.title}</div>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans">
                        {repB.summary}
                      </p>
                      <div className="text-[10px] text-stone-400">
                        {repB.elements.length} diagram elements generated
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Focused Representation Preview */
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-sans flex items-center gap-1">
                        <Sparkles size={11} />
                        Generated Representation
                      </span>
                      <h3 className="text-sm font-bold text-stone-900 font-sans mt-0.5">
                        {repA.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-stone-600 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200/70">
                      {repA.elements.length} Elements Ready
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50/80 border border-stone-200/80 rounded-xl space-y-2">
                    <p className="text-stone-700 text-xs leading-relaxed font-sans">{repA.summary}</p>
                    <div className="text-[11px] text-stone-500 font-sans pt-1 border-t border-stone-200/60">
                      Includes: Core Visual Metaphor, Reasoning Chips, and Perspective Stickies.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 mt-3">
              <span className="text-[11px] text-stone-500">
                Returns to your active slide without losing existing napkin sketches.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApply(true)}
                  className="px-3.5 py-2 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/90 font-medium text-xs transition-all flex items-center gap-1.5"
                >
                  <Copy size={13} />
                  <span>Branch as New Slide</span>
                </button>
                <button
                  onClick={() => handleApply(false)}
                  className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Apply to Current Canvas</span>
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
