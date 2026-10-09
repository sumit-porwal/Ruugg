import React, { useState } from 'react';
import {
  X,
  FileText,
  Presentation,
  FileImage,
  Archive,
  Download,
  CheckCircle,
  Loader2,
  Code,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { ProjectState, Slide } from '../types';
import {
  exportToPdf,
  exportToPptx,
  exportSlideToPng,
  exportSlideToSvg,
  exportDeckToZip,
  exportNotesToMarkdown,
  type ExportProgress,
} from '../utils/exportEngine';

interface ExportModalProps {
  project: ProjectState;
  activeSlide: Slide;
  isOpen: boolean;
  onClose: () => void;
  onShowNotification: (msg: string) => void;
  initialTab?: ExportTab;
}

export type ExportTab = 'pdf' | 'ppt' | 'image' | 'batch';

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  activeSlide,
  isOpen,
  onClose,
  onShowNotification,
  initialTab = 'pdf',
}) => {
  const [activeTab, setActiveTab] = useState<ExportTab>(initialTab);

  // PDF options
  const [pdfScope, setPdfScope] = useState<'all' | 'current'>('all');
  const [pdfQuality, setPdfQuality] = useState<'standard' | 'hd'>('hd');
  const [pdfIncludeNotes, setPdfIncludeNotes] = useState<boolean>(true);

  // PPTX options
  const [pptxScope, setPptxScope] = useState<'all' | 'current'>('all');

  // Image options
  const [pngScale, setPngScale] = useState<number>(2); // 1, 1.5, 2
  const [pngTransparent, setPngTransparent] = useState<boolean>(false);

  // Loading & Progress state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  if (!isOpen) return null;

  const activeIndex = project.slides.findIndex((s) => s.id === activeSlide.id);

  const handleExportPdf = async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: pdfScope === 'all' ? project.slides.length : 1, phase: 'Initializing PDF presentation...' });
    try {
      await exportToPdf(project, {
        scope: pdfScope,
        activeSlideId: activeSlide.id,
        quality: pdfQuality,
        includeNotes: pdfIncludeNotes,
        onProgress: (p) => setProgress(p),
      });
      onShowNotification('📄 Successfully exported presentation PDF!');
      onClose();
    } catch (err: any) {
      console.error(err);
      onShowNotification(`❌ PDF export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  };

  const handleExportPptx = async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: pptxScope === 'all' ? project.slides.length : 1, phase: 'Initializing PowerPoint presentation...' });
    try {
      await exportToPptx(project, {
        scope: pptxScope,
        activeSlideId: activeSlide.id,
        onProgress: (p) => setProgress(p),
      });
      onShowNotification('📊 Successfully exported PowerPoint presentation (.pptx)!');
      onClose();
    } catch (err: any) {
      console.error(err);
      onShowNotification(`❌ PowerPoint export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  };

  const handleExportPng = () => {
    exportSlideToPng(activeSlide, {
      scale: pngScale,
      transparentBg: pngTransparent,
    });
    onShowNotification(`🖼️ Exported slide as PNG (${pngScale}x resolution)!`);
  };

  const handleExportSvg = () => {
    exportSlideToSvg(activeSlide);
    onShowNotification('📐 Exported slide as vector SVG!');
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: project.slides.length, phase: 'Preparing slide images...' });
    try {
      await exportDeckToZip(project, {
        scale: 1.5,
        onProgress: (p) => setProgress(p),
      });
      onShowNotification('📦 Exported full slide deck as ZIP archive!');
      onClose();
    } catch (err: any) {
      console.error(err);
      onShowNotification(`❌ ZIP export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  };

  const handleExportMarkdown = () => {
    exportNotesToMarkdown(project);
    onShowNotification('📝 Exported slide notes & visual outline as Markdown!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Download size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-['Outfit']">
                Export Presentation & Visuals
              </h2>
              <p className="text-xs text-stone-500">
                Generate deliverable presentation decks, high-res images, and outline bundles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-stone-200/80 bg-white">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'pdf'
                ? 'border-rose-600 text-rose-700 bg-rose-50/50 rounded-t-xl'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText size={15} className="text-rose-600" />
            <span>PDF Presentation</span>
          </button>

          <button
            onClick={() => setActiveTab('ppt')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'ppt'
                ? 'border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-xl'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Presentation size={15} className="text-amber-600" />
            <span>PowerPoint (.pptx)</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'image'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileImage size={15} className="text-blue-600" />
            <span>Images & Vector</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'batch'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Archive size={15} className="text-indigo-600" />
            <span>Batch & Outline</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: PDF PRESENTATION */}
          {activeTab === 'pdf' && (
            <div className="space-y-5">
              <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3">
                <FileText size={22} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-rose-950 font-['Outfit']">
                    Export Presentation as PDF
                  </h3>
                  <p className="text-xs text-rose-800/80 mt-0.5">
                    Generates a widescreen (16:9) presentation document. Suitable for sharing, printing, or presenting in fullscreen PDF reader.
                  </p>
                </div>
              </div>

              {/* Scope Selection */}
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  Slides to Include
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPdfScope('all')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      pdfScope === 'all'
                        ? 'border-rose-600 bg-rose-50/30 ring-2 ring-rose-500/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900">Entire Slide Deck</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-stone-100 rounded-full text-stone-600">
                        {project.slides.length} slides
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Multi-page PDF containing all napkins in sequence
                    </p>
                  </button>

                  <button
                    onClick={() => setPdfScope('current')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      pdfScope === 'current'
                        ? 'border-rose-600 bg-rose-50/30 ring-2 ring-rose-500/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900">Current Slide Only</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        Slide #{activeIndex + 1}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">
                      "{activeSlide.title}"
                    </p>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    Render Resolution
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPdfQuality('hd')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        pdfQuality === 'hd'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      Ultra-Crisp (HD)
                    </button>
                    <button
                      onClick={() => setPdfQuality('standard')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        pdfQuality === 'standard'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      Compact (1080p)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    Speaker Notes
                  </label>
                  <label className="flex items-center gap-2.5 p-2 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pdfIncludeNotes}
                      onChange={(e) => setPdfIncludeNotes(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-stone-800">Include Speaker Notes Pages</span>
                      <p className="text-[10px] text-stone-500">Appends questions & thinking cues</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{progress?.phase || 'Generating PDF...'}</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>
                        Download PDF ({pdfScope === 'all' ? `${project.slides.length} Slides` : 'Current Slide'})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: POWERPOINT (PPTX) */}
          {activeTab === 'ppt' && (
            <div className="space-y-5">
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
                <Presentation size={22} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-950 font-['Outfit']">
                    Export to PowerPoint (.pptx)
                  </h3>
                  <p className="text-xs text-amber-800/80 mt-0.5">
                    Creates native Microsoft PowerPoint (.pptx) presentation. Each slide includes the high-res napkin visual drawing and speaker notes directly placed in PowerPoint Presenter Notes.
                  </p>
                </div>
              </div>

              {/* Scope Selection */}
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  Slides to Include
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPptxScope('all')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      pptxScope === 'all'
                        ? 'border-amber-600 bg-amber-50/30 ring-2 ring-amber-500/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900">All Slides ({project.slides.length})</span>
                      <Layers size={14} className="text-amber-600" />
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Complete visual deck ready for PowerPoint, Google Slides, or Keynote
                    </p>
                  </button>

                  <button
                    onClick={() => setPptxScope('current')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      pptxScope === 'current'
                        ? 'border-amber-600 bg-amber-50/30 ring-2 ring-amber-500/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900">Current Slide Only</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                        #{activeIndex + 1}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">
                      "{activeSlide.title}"
                    </p>
                  </button>
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-xs text-stone-600 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-stone-800">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>PowerPoint Features Included:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-600 pl-1">
                  <li>Standard 16:9 widescreen layout compatible with PPT, Keynote & Google Slides</li>
                  <li>High-resolution 1080p canvas rendering with authentic paper texture</li>
                  <li>Speaker Notes and Visual Thinking Cues added to Presenter View</li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleExportPptx}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-amber-600/20 transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{progress?.phase || 'Generating PowerPoint...'}</span>
                    </>
                  ) : (
                    <>
                      <Presentation size={16} />
                      <span>
                        Download PowerPoint (.pptx) — {pptxScope === 'all' ? `${project.slides.length} Slides` : 'Current Slide'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGES & VECTOR */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PNG Card */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileImage size={18} className="text-blue-600" />
                      <h4 className="text-xs font-bold text-stone-900">Current Slide as PNG</h4>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      High-resolution image of "{activeSlide.title}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600 font-medium">Quality Scale:</span>
                      <div className="flex items-center gap-1">
                        {[1, 1.5, 2].map((s) => (
                          <button
                            key={s}
                            onClick={() => setPngScale(s)}
                            className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border ${
                              pngScale === s
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-stone-600 border-stone-200'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pngTransparent}
                        onChange={(e) => setPngTransparent(e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span>Transparent background (no paper)</span>
                    </label>
                  </div>

                  <button
                    onClick={handleExportPng}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Download size={14} />
                    <span>Download PNG</span>
                  </button>
                </div>

                {/* SVG Card */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Code size={18} className="text-violet-600" />
                      <h4 className="text-xs font-bold text-stone-900">Current Slide as SVG</h4>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Scalable vector container with embedded napkin elements
                    </p>
                  </div>

                  <div className="text-[11px] text-stone-500 bg-white p-2.5 rounded-xl border border-stone-200">
                    Perfect for embedding in web pages, Figma canvas, or Illustrator diagrams.
                  </div>

                  <button
                    onClick={handleExportSvg}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Download size={14} />
                    <span>Download SVG</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BATCH & OUTLINE */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-2xl p-4 flex items-start gap-3">
                <Archive size={22} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-indigo-950 font-['Outfit']">
                    Batch Export & Markdown Outline
                  </h3>
                  <p className="text-xs text-indigo-800/80 mt-0.5">
                    Package all slide drawings as an offline ZIP archive or export your visual thinking notes as formatted Markdown.
                  </p>
                </div>
              </div>

              {/* All Slides ZIP Archive */}
              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Archive size={18} className="text-indigo-600" />
                    <h4 className="text-xs font-bold text-indigo-950">Export Deck as ZIP Archive</h4>
                  </div>
                  <p className="text-[11px] text-indigo-800/80 mt-0.5">
                    Packages all {project.slides.length} slides as numbered PNGs + project file + visual outline markdown.
                  </p>
                </div>

                <button
                  onClick={handleExportZip}
                  disabled={isExporting}
                  className="shrink-0 flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-60"
                >
                  <Archive size={14} />
                  <span>Download ZIP</span>
                </button>
              </div>

              {/* Markdown Notes Outline */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-white flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-stone-600" />
                    <h4 className="text-xs font-bold text-stone-900">
                      Visual Thinking Outline (Markdown)
                    </h4>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Export all slide titles, frameworks, core questions, speaker notes, and semantic tags as formatted Markdown.
                  </p>
                </div>
                <button
                  onClick={handleExportMarkdown}
                  className="shrink-0 flex items-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all"
                >
                  <FileText size={14} className="text-stone-600" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>
          )}

          {/* Real-time Progress Bar */}
          {isExporting && progress && (
            <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                  <span>{progress.phase}</span>
                </span>
                <span>
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${Math.round((progress.current / Math.max(1, progress.total)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200/80 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-emerald-500" />
            <span>Deck: <strong>{project.title}</strong> ({project.slides.length} slides)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl hover:bg-stone-200 text-stone-700 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
