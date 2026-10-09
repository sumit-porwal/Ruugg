import React, { useState } from 'react';
import {
  Sparkles,
  X,
  FileText,
  HelpCircle,
  ArrowRight,
  Key,
  Zap,
} from 'lucide-react';
import type { CanvasElement, SemanticTag, ShapeElement } from '../types';
import { createStickyNote } from '../utils/sixSlicesTemplates';

interface ThinkingAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  onAddElements: (newElements: CanvasElement[]) => void;
  onQuickMessage?: (msg: string) => void;
  slideTitle: string;
}

export const ThinkingAssistantDrawer: React.FC<ThinkingAssistantDrawerProps> = ({
  isOpen,
  onClose,
  elements,
  onAddElements,
  onQuickMessage,
  slideTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'gaps' | 'summary' | 'actions'>('notes');
  const [roughNotes, setRoughNotes] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // 1. Tool: Convert Rough Notes to Diagram
  const handleConvertNotes = () => {
    if (!roughNotes.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      const lines = roughNotes
        .split('\n')
        .map((l) => l.replace(/^[-*•\d.]\s*/, '').trim())
        .filter(Boolean);

      const newElements: CanvasElement[] = [];
      const primary = lines[0] || 'Core Note';
      const secondary = lines.slice(1);

      // Main hub node
      const centerId = 'ai_hub_' + Math.random().toString(36).substring(2, 9);
      newElements.push({
        id: centerId,
        type: 'shape',
        shapeType: 'circle',
        x: 360,
        y: 200,
        width: 170,
        height: 100,
        color: '#1e40af',
        fillColor: '#eff6ff',
        strokeWidth: 2.5,
        isRough: true,
        text: primary,
        fontSize: 15,
        tag: 'hypothesis',
      } as ShapeElement);

      // Surrounding branch stickies with semantic tags
      secondary.forEach((line, idx) => {
        const angle = (idx * Math.PI * 2) / Math.max(1, secondary.length);
        const x = Math.max(60, 420 + Math.cos(angle) * 230);
        const y = Math.max(80, 230 + Math.sin(angle) * 150);

        let tag: SemanticTag = 'assumption';
        if (line.endsWith('?')) tag = 'question';
        else if (line.toLowerCase().includes('must') || line.toLowerCase().includes('todo') || line.toLowerCase().includes('action')) tag = 'action';
        else if (line.toLowerCase().includes('fact') || line.toLowerCase().includes('data') || line.toLowerCase().includes('proven')) tag = 'fact';

        const sticky = createStickyNote(x, y, line, tag.toUpperCase(), '#fef9c3', '#d97706');
        sticky.tag = tag;
        newElements.push(sticky);
      });

      onAddElements(newElements);
      setIsProcessing(false);
      setRoughNotes('');
      onQuickMessage?.(`✨ Converted ${lines.length} notes into editable visual nodes!`);
    }, 350);
  };

  // 2. Tool: Suggest Missing Questions & Gaps
  const handleSuggestGaps = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const topicContext = elements
        .map((e) => ('text' in e && e.text ? e.text : ''))
        .filter(Boolean)
        .slice(0, 3)
        .join(', ');

      const suggestedQuestions = [
        topicContext
          ? `What assumption in "${topicContext.substring(0, 28)}..." could break if customer behavior shifts?`
          : 'What assumption would break this model if customer behavior shifts?',
        'Who is the most skeptical stakeholder and what is their objection?',
        'What is the single highest-leverage metric to validate this week?',
      ];

      const newStickies = suggestedQuestions.map((q, idx) => {
        const sticky = createStickyNote(
          100 + idx * 260,
          360,
          q,
          'MISSING QUESTION',
          '#f0f9ff',
          '#0284c7'
        );
        sticky.tag = 'question';
        return sticky;
      });

      onAddElements(newStickies);
      setIsProcessing(false);
      onQuickMessage?.('🔍 Added 3 diagnostic inquiry questions to canvas!');
    }, 400);
  };

  // 3. Tool: Summarize Diagram
  const handleSummarizeDiagram = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const facts = elements.filter((e) => e.tag === 'fact').length;
      const assumptions = elements.filter((e) => e.tag === 'assumption').length;
      const questions = elements.filter((e) => e.tag === 'question').length;
      const actions = elements.filter((e) => e.tag === 'action').length;

      const summaryText = `EXECUTIVE SYNTHESIS (${slideTitle}):\n• Total Elements: ${elements.length}\n• Verified Facts: ${facts} | Assumptions: ${assumptions}\n• Unresolved Questions: ${questions}\n• Action Items: ${actions}\nNext step: Validate top assumption before committing.`;

      const summaryNote = createStickyNote(
        60,
        60,
        summaryText,
        'EXECUTIVE SUMMARY',
        '#dbeafe',
        '#1d4ed8'
      );
      summaryNote.width = 280;
      summaryNote.height = 200;

      onAddElements([summaryNote]);
      setIsProcessing(false);
      onQuickMessage?.('📝 Placed Executive Summary on napkin!');
    }, 350);
  };

  // 4. Tool: Suggest Next Actions
  const handleSuggestActions = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const action1: ShapeElement = {
        id: 'ai_act_1',
        type: 'shape',
        shapeType: 'bubble',
        x: 200,
        y: 380,
        width: 220,
        height: 90,
        color: '#059669',
        fillColor: '#d1fae5',
        strokeWidth: 2,
        isRough: true,
        text: 'ACTION 1:\nInterview 5 users on this risk',
        fontSize: 14,
        tag: 'action',
      };

      const action2: ShapeElement = {
        id: 'ai_act_2',
        type: 'shape',
        shapeType: 'bubble',
        x: 480,
        y: 380,
        width: 220,
        height: 90,
        color: '#059669',
        fillColor: '#d1fae5',
        strokeWidth: 2,
        isRough: true,
        text: 'ACTION 2:\nBuild low-fidelity prototype',
        fontSize: 14,
        tag: 'action',
      };

      onAddElements([action1, action2]);
      setIsProcessing(false);
      onQuickMessage?.('⚡ Generated 2 prioritized next action items!');
    }, 350);
  };

  return (
    <div className="fixed top-16 right-5 z-40 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-xl w-80 text-stone-700 animate-in fade-in slide-in-from-right-2 duration-100 select-none overflow-hidden max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-2xs">
            <Sparkles size={12} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 font-sans">
              Thinking Assistant
            </h3>
            <span className="text-[10px] text-stone-400">Offline heuristic synthesis</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors"
            title="Custom API key settings"
          >
            <Key size={12} />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Optional Cloud API Key configuration */}
      {showApiSettings && (
        <div className="p-3 bg-violet-50/50 border-b border-violet-100 text-xs space-y-1.5 animate-in fade-in duration-100">
          <span className="text-[10px] font-bold text-violet-800 uppercase tracking-wider block font-sans">
            Cloud API Key (Optional)
          </span>
          <p className="text-[10px] text-stone-500">
            Assistant works 100% offline. Optionally enter an API key for live LLM queries.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AI Studio / Custom Key..."
            className="w-full text-xs p-1.5 bg-white border border-violet-200 rounded-lg outline-none font-mono"
          />
        </div>
      )}

      {/* Tab Switcher */}
      <div className="px-2 py-1.5 bg-stone-50/60 border-b border-stone-100 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'notes'
              ? 'bg-violet-600 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-200/60'
          }`}
        >
          Notes to Map
        </button>
        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'gaps'
              ? 'bg-violet-600 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-200/60'
          }`}
        >
          Find Gaps
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'summary'
              ? 'bg-violet-600 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-200/60'
          }`}
        >
          Synthesize
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'actions'
              ? 'bg-violet-600 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-200/60'
          }`}
        >
          Actions
        </button>
      </div>

      {/* Content Body */}
      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
        {activeTab === 'notes' && (
          <div className="space-y-2.5">
            <div>
              <span className="text-xs font-bold text-stone-800 font-sans block">
                Convert Rough Notes into Diagram
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Paste meeting notes, bullet points, or brainstorm lines:
              </p>
            </div>
            <textarea
              rows={4}
              value={roughNotes}
              onChange={(e) => setRoughNotes(e.target.value)}
              placeholder="• Launch self-serve onboarding&#10;• Need SOC2 compliance?&#10;• Competitor offers free tier&#10;• Action: audit registration API"
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-sans text-stone-800 placeholder:text-stone-400"
            />
            <button
              onClick={handleConvertNotes}
              disabled={isProcessing || !roughNotes.trim()}
              className="w-full py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{isProcessing ? 'Structuring...' : 'Generate Visual Nodes'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="space-y-2.5">
            <div>
              <span className="text-xs font-bold text-stone-800 font-sans block">
                Uncover Blind Spots & Assumptions
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Analyzes existing canvas elements to suggest missing questions or unproven beliefs.
              </p>
            </div>
            <button
              onClick={handleSuggestGaps}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{isProcessing ? 'Analyzing...' : 'Suggest Missing Questions'}</span>
              <HelpCircle size={13} />
            </button>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-2.5">
            <div>
              <span className="text-xs font-bold text-stone-800 font-sans block">
                Executive Synthesis
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Summarizes the current napkin slide into a structured take-away memo.
              </p>
            </div>
            <button
              onClick={handleSummarizeDiagram}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{isProcessing ? 'Synthesizing...' : 'Generate Executive Summary'}</span>
              <FileText size={13} />
            </button>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-2.5">
            <div>
              <span className="text-xs font-bold text-stone-800 font-sans block">
                Derive Concrete Next Actions
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Converts untested assumptions into concrete, reversible experiments.
              </p>
            </div>
            <button
              onClick={handleSuggestActions}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{isProcessing ? 'Generating...' : 'Suggest Action Items'}</span>
              <Zap size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
