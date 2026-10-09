import React, { useState, useRef, useEffect } from 'react';
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Download,
  Sparkles,
  Presentation,
  FileImage,
  FileText,
  Save,
  Check,
  FolderOpen,
  FilePlus,
  RotateCcw,
  Compass,
  Layers,
  GitCompare,
  HelpCircle,
  ChevronDown,
  SlidersHorizontal,
  Code,
  Archive,
  FileSpreadsheet,
} from 'lucide-react';
import type { Slide } from '../types';

interface TopBarProps {
  projectTitle: string;
  onUpdateProjectTitle: (title: string) => void;
  activeSlide: Slide;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onOpenGoalStart: () => void;
  onOpenFrameworkLibrary: () => void;
  onOpenSqvidStudio: () => void;
  onOpenFrameworkSwitch: () => void;
  onToggleAssistant: () => void;
  isAssistantOpen: boolean;
  onStartPresentation: () => void;
  // File operations (File menu)
  isDirty?: boolean;
  onNewDeck: () => void;
  onOpenFile: () => void;
  onSaveProject: () => void;
  onSaveAsFile: (format?: 'napkin' | 'json') => void;
  onResetProject?: () => void;
  // Export operations (Export menu)
  onOpenExportModal: () => void;
  onExportPdf: () => void;
  onExportPptx: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportZip: () => void;
  onExportMarkdown: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  projectTitle,
  onUpdateProjectTitle,
  activeSlide,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenGoalStart,
  onOpenFrameworkLibrary,
  onOpenSqvidStudio,
  onOpenFrameworkSwitch,
  onToggleAssistant,
  isAssistantOpen,
  onStartPresentation,
  isDirty = false,
  onNewDeck,
  onOpenFile,
  onSaveProject,
  onSaveAsFile,
  onResetProject,
  onOpenExportModal,
  onExportPdf,
  onExportPptx,
  onExportPng,
  onExportSvg,
  onExportZip,
  onExportMarkdown,
}) => {
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fileMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setShowFileMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    if (showFileMenu || showExportMenu) {
      window.addEventListener('mousedown', handleClickOutside);
      return () => window.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFileMenu, showExportMenu]);

  return (
    <header className="h-14 px-4 bg-white/95 backdrop-blur-md border-b border-stone-200/90 flex items-center justify-between z-30 select-none gap-2">
      {/* Brand, File Menu & Deck Title */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <span className="font-['Kalam'] font-bold text-lg">N</span>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-stone-900 tracking-tight font-['Outfit']">
                NapkinCanvas
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated File Menu Dropdown */}
        <div className="relative" ref={fileMenuRef}>
          <button
            onClick={() => {
              setShowFileMenu(!showFileMenu);
              setShowExportMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors border border-stone-200/60"
            title="File Menu (New, Open, Save)"
          >
            <span>File</span>
            <ChevronDown size={12} className="text-stone-400" />
          </button>

          {showFileMenu && (
            <div className="absolute left-0 top-10 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl p-1.5 flex flex-col gap-1 z-40 animate-in fade-in zoom-in-95 duration-100">
              {/* New Blank Deck */}
              <button
                onClick={() => {
                  onNewDeck();
                  setShowFileMenu(false);
                }}
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <FilePlus size={15} className="text-blue-600" />
                  <span className="font-semibold text-stone-900">New Deck</span>
                </div>
              </button>

              {/* Open Project File */}
              <button
                onClick={() => {
                  onOpenFile();
                  setShowFileMenu(false);
                }}
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen size={15} className="text-indigo-600" />
                  <span className="font-semibold text-stone-900">Open Project...</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">Ctrl+O</span>
              </button>

              <div className="h-[1px] bg-stone-100 my-0.5" />

              {/* Quick Save */}
              <button
                onClick={() => {
                  onSaveProject();
                  setShowFileMenu(false);
                }}
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Save size={15} className="text-emerald-600" />
                  <div>
                    <div className="font-semibold text-stone-900">Save</div>
                    <div className="text-[10px] text-stone-400">Save directly to file</div>
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">Ctrl+S</span>
              </button>

              {/* Save As (.napkin) */}
              <button
                onClick={() => {
                  onSaveAsFile('napkin');
                  setShowFileMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <FileSpreadsheet size={15} className="text-emerald-500" />
                <div>
                  <div className="font-semibold text-stone-900">Save As (.napkin)...</div>
                  <div className="text-[10px] text-stone-400">Native visual thinking file</div>
                </div>
              </button>

              {/* Save As JSON */}
              <button
                onClick={() => {
                  onSaveAsFile('json');
                  setShowFileMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <Code size={15} className="text-amber-500" />
                <div>
                  <div className="font-semibold text-stone-900">Save As JSON (.json)...</div>
                  <div className="text-[10px] text-stone-400">Standard JSON structure</div>
                </div>
              </button>

              {onResetProject && (
                <>
                  <div className="h-[1px] bg-stone-100 my-0.5" />
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all slides to the fresh starter visual thinking deck?')) {
                        onResetProject();
                        setShowFileMenu(false);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                  >
                    <RotateCcw size={15} className="text-rose-500" />
                    <div>
                      <div className="font-semibold">Reset to Starter Deck</div>
                      <div className="text-[10px] text-stone-400">Restore default templates</div>
                    </div>
                  </button>
                </>
              )}

              <div className="p-2 bg-stone-50 rounded-xl border border-stone-100 mt-1">
                <span className="text-[10px] text-stone-400 flex items-center gap-1.5">
                  <Check size={11} className="text-emerald-500 shrink-0" />
                  <span>Changes auto-save locally</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="w-[1px] h-5 bg-stone-200 mx-0.5 hidden md:block" />

        {/* Project Title Input */}
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => onUpdateProjectTitle(e.target.value)}
          className="text-xs font-semibold text-stone-700 hover:text-stone-900 bg-transparent hover:bg-stone-100/80 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 outline-none transition-all max-w-[120px] sm:max-w-[170px] truncate"
          title="Click to rename deck"
        />

        {/* Quick Save Status Button */}
        <button
          onClick={onSaveProject}
          title={isDirty ? 'Save changes to disk (Ctrl+S)' : 'All changes saved locally (Ctrl+S)'}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium transition-all ${
            isDirty
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-xs'
              : 'hover:bg-stone-100 text-stone-600'
          }`}
        >
          {isDirty ? (
            <Save size={13} className="text-amber-600" />
          ) : (
            <Check size={13} className="text-emerald-600" />
          )}
          <span className="hidden sm:inline text-[11px] font-semibold">
            {isDirty ? 'Save' : 'Saved'}
          </span>
        </button>
      </div>

      {/* Center Action Group: Goal Starter, Framework Library, SQVID Studio, Switch Mode */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
        {/* Goal Starter Button */}
        <button
          onClick={onOpenGoalStart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 border border-blue-200/80 text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <HelpCircle size={14} className="text-blue-600" />
          <span className="whitespace-nowrap">What to figure out?</span>
        </button>

        {/* Frameworks Library Button */}
        <button
          onClick={onOpenFrameworkLibrary}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 text-stone-700 border border-stone-200/60 text-xs font-semibold transition-all shrink-0"
        >
          <Layers size={14} className="text-stone-500" />
          <span className="hidden md:inline whitespace-nowrap">Frameworks</span>
        </button>

        {/* SQVID Exploration Studio */}
        <button
          onClick={onOpenSqvidStudio}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 text-purple-700 border border-purple-200/70 text-xs font-semibold transition-all shrink-0"
          title="Dan Roam's SQVID Visual Exploration Studio"
        >
          <Compass size={14} className="text-purple-600" />
          <span className="hidden md:inline whitespace-nowrap">SQVID Studio</span>
        </button>

        {/* Switch Framework Transformation */}
        <button
          onClick={onOpenFrameworkSwitch}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 text-stone-700 border border-stone-200/60 text-xs font-semibold transition-all shrink-0"
          title="Switch Framework: Map this diagram into a different thinking structure without losing notes or tags"
        >
          <GitCompare size={14} className="text-stone-500" />
          <span className="hidden sm:inline whitespace-nowrap">Switch Framework</span>
        </button>

        {/* Thinking Assistant Drawer Toggle */}
        <button
          onClick={onToggleAssistant}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            isAssistantOpen
              ? 'bg-violet-600 text-white shadow-sm font-bold'
              : 'hover:bg-violet-50 text-violet-700 border border-violet-200/60'
          }`}
          title="Smart Thinking Assistant: Convert notes, find blind spots, summarize"
        >
          <Sparkles size={14} />
          <span className="hidden lg:inline whitespace-nowrap">Assistant</span>
        </button>

        {/* Active Slide Framework / Question Pill */}
        {activeSlide && (
          <div
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/90 border border-stone-200/70 text-xs text-stone-600 max-w-[180px] truncate"
            title={activeSlide.questionPrompt || activeSlide.title}
          >
            <span className="font-bold text-blue-600 font-['Outfit'] text-[11px]">Active:</span>
            <span className="font-medium truncate text-stone-800 text-xs">
              {activeSlide.title}
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: Undo/Redo, Zoom, Export, Present */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5 border-r border-stone-200 pr-1.5">
          <button
            title="Undo (Ctrl+Z)"
            disabled={!canUndo}
            onClick={onUndo}
            className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Undo size={15} />
          </button>
          <button
            title="Redo (Ctrl+Y)"
            disabled={!canRedo}
            onClick={onRedo}
            className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Redo size={15} />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="hidden md:flex items-center gap-0.5 border-r border-stone-200 pr-1.5 text-stone-600">
          <button
            title="Zoom Out (-)"
            onClick={onZoomOut}
            className="p-1 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors"
          >
            <ZoomOut size={15} />
          </button>
          <button
            title="Reset Zoom to 100%"
            onClick={onResetZoom}
            className="text-[11px] font-semibold px-1 py-0.5 rounded hover:bg-stone-100 transition-colors min-w-[38px] text-center"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            title="Zoom In (+)"
            onClick={onZoomIn}
            className="p-1 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors"
          >
            <ZoomIn size={15} />
          </button>
        </div>

        {/* Dedicated Export Dropdown Menu (Strictly Export Deliverables) */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowFileMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
            title="Export Presentation, PDF, PowerPoint, Images"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown size={12} className="text-stone-400" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-10 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl p-1.5 flex flex-col gap-1 z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Export Presentation Deliverables
              </div>

              {/* Export to PDF */}
              <button
                onClick={() => {
                  onExportPdf();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                  <FileText size={14} />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Export Deck to PDF</div>
                  <div className="text-[10px] text-stone-400">16:9 presentation document</div>
                </div>
              </button>

              {/* Export to PowerPoint (PPTX) */}
              <button
                onClick={() => {
                  onExportPptx();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Presentation size={14} />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Export to PowerPoint (.pptx)</div>
                  <div className="text-[10px] text-stone-400">Slides with speaker notes</div>
                </div>
              </button>

              <div className="h-[1px] bg-stone-100 my-0.5" />

              {/* Export Slide as PNG */}
              <button
                onClick={() => {
                  onExportPng();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <FileImage size={14} />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Export Slide as PNG</div>
                  <div className="text-[10px] text-stone-400">Crisp napkin image</div>
                </div>
              </button>

              {/* Export Slide as SVG */}
              <button
                onClick={() => {
                  onExportSvg();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                  <Code size={14} />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Export Slide as SVG</div>
                  <div className="text-[10px] text-stone-400">Scalable vector container</div>
                </div>
              </button>

              {/* Export Deck as ZIP */}
              <button
                onClick={() => {
                  onExportZip();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Archive size={14} />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Export Deck as ZIP Archive</div>
                  <div className="text-[10px] text-stone-400">All slide images + outline</div>
                </div>
              </button>

              {/* Export Outline as Markdown */}
              <button
                onClick={() => {
                  onExportMarkdown();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <FileText size={14} />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Export Notes to Markdown</div>
                  <div className="text-[10px] text-stone-400">Visual thinking text outline</div>
                </div>
              </button>

              <div className="h-[1px] bg-stone-100 my-0.5" />

              {/* Export Center Modal */}
              <button
                onClick={() => {
                  onOpenExportModal();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-50 rounded-xl transition-colors text-left bg-violet-50/40"
              >
                <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700 shrink-0">
                  <SlidersHorizontal size={14} />
                </div>
                <div>
                  <div className="font-bold">Export Options & Settings...</div>
                  <div className="text-[10px] text-violet-600/80">Configure resolution, notes, scope</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Present Button */}
        <button
          onClick={onStartPresentation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Presentation size={14} />
          <span className="hidden sm:inline">Present</span>
        </button>
      </div>
    </header>
  );
};
