import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  CanvasElement,
  FrameworkId,
  PaperTexture,
  ProjectState,
  ShapeElement,
  ShapeType,
  SixSliceType,
  Slide,
  Tool,
} from './types';
import { getInitialProject } from './utils/initialProject';
import { createModelElement, createStickyNote, SIX_SLICES_INFO } from './utils/sixSlicesTemplates';
import { FRAMEWORKS_REGISTRY, createConnector } from './utils/frameworkRegistry';
import { NapkinCanvas } from './components/NapkinCanvas';
import { Toolbar } from './components/Toolbar';
import { TopBar } from './components/TopBar';
import { SlideDeck } from './components/SlideDeck';
import { SixSlicesModal } from './components/SixSlicesModal';
import { VisualVocabularyModal } from './components/VisualVocabularyModal';
import { ElementInspector } from './components/ElementInspector';
import { PresentationMode } from './components/PresentationMode';
import { GoalStartModal } from './components/GoalStartModal';
import { FrameworkLibraryModal } from './components/FrameworkLibraryModal';
import { GuidedThinkingDrawer } from './components/GuidedThinkingDrawer';
import { SqvidStudioModal } from './components/SqvidStudioModal';
import { FrameworkSwitchModal } from './components/FrameworkSwitchModal';
import { ThinkingAssistantDrawer } from './components/ThinkingAssistantDrawer';
import { ExportModal } from './components/ExportModal';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  saveProjectWithPicker,
  openProjectFromFilePicker,
  exportNapkinFile,
  parseProjectFile,
} from './utils/fileStorage';
import {
  exportToPdf,
  exportToPptx,
  exportSlideToPng,
  exportSlideToSvg,
  exportDeckToZip,
  exportNotesToMarkdown,
} from './utils/exportEngine';
import { FolderOpen } from 'lucide-react';

export const App: React.FC = () => {
  const [project, setProject] = useState<ProjectState>(() => {
    return loadFromLocalStorage();
  });

  // Undo / Redo history
  const [undoStack, setUndoStack] = useState<ProjectState[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectState[]>([]);

  // Active Tooling State
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#1e293b');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [currentShapeType, setCurrentShapeType] = useState<ShapeType>('rect');
  const [isRough, setIsRough] = useState<boolean>(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Canvas Viewport Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Modals & Modes
  const [isGoalStartOpen, setIsGoalStartOpen] = useState(false);
  const [isFrameworkLibraryOpen, setIsFrameworkLibraryOpen] = useState(false);
  const [isSqvidStudioOpen, setIsSqvidStudioOpen] = useState(false);
  const [isFrameworkSwitchOpen, setIsFrameworkSwitchOpen] = useState(false);
  const [targetFrameworkForSwitch, setTargetFrameworkForSwitch] = useState<FrameworkId | undefined>(undefined);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeGuidedFrameworkId, setActiveGuidedFrameworkId] = useState<FrameworkId | null>(null);

  const [isSixSlicesOpen, setIsSixSlicesOpen] = useState(false);
  const [isStampsOpen, setIsStampsOpen] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // File persistence & save states
  const [isDirty, setIsDirty] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileHandleRef = useRef<any>(null);

  // Toast notification
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<any>(null);

  const showNotification = useCallback((msg: string) => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification(msg);
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    saveToLocalStorage(project);
  }, [project]);

  // Find active slide
  const activeSlide =
    project.slides.find((s) => s.id === project.activeSlideId) || project.slides[0];

  const pushHistory = useCallback(
    (newProject: ProjectState) => {
      setUndoStack((prev) => [...prev.slice(-25), project]);
      setRedoStack([]);
      setProject(newProject);
      setIsDirty(true);
    },
    [project]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, s.length - 1));
    setRedoStack((s) => [...s, project]);
    setProject(prev);
    setSelectedElementId(null);
  }, [undoStack, project]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((s) => s.slice(0, s.length - 1));
    setUndoStack((s) => [...s, project]);
    setProject(next);
    setSelectedElementId(null);
  }, [redoStack, project]);

  const [eraserSize, setEraserSize] = useState<number>(24);

  // Update elements of the current slide cleanly and record undo state
  const handleElementsChange = useCallback(
    (newElements: CanvasElement[]) => {
      setProject((prev) => {
        const updatedSlides = prev.slides.map((s) =>
          s.id === prev.activeSlideId ? { ...s, elements: newElements } : s
        );
        const nextProject = {
          ...prev,
          slides: updatedSlides,
        };
        setUndoStack((u) => [...u.slice(-25), prev]);
        setRedoStack([]);
        return nextProject;
      });
    },
    []
  );

  const handleClearSlide = useCallback(() => {
    if (activeSlide.elements.length === 0) return;
    handleElementsChange([]);
    setSelectedElementId(null);
    showNotification('🧹 Cleared all drawings and notes on this napkin slide! (Ctrl+Z to undo)');
  }, [activeSlide.elements.length, handleElementsChange, showNotification]);

  // Update paper texture of current slide
  const handleSelectPaperTexture = (texture: PaperTexture) => {
    const updatedSlides = project.slides.map((s) =>
      s.id === project.activeSlideId ? { ...s, paperTexture: texture } : s
    );
    pushHistory({
      ...project,
      slides: updatedSlides,
    });
  };

  // Slides management
  const handleSelectSlide = (id: string) => {
    setProject((prev) => ({ ...prev, activeSlideId: id }));
    setSelectedElementId(null);
    setActiveGuidedFrameworkId(null);
  };

  const handleAddSlide = (sliceTag?: SixSliceType) => {
    const newId = 'slide_' + Math.random().toString(36).substring(2, 9);
    const sliceInfo = sliceTag ? SIX_SLICES_INFO[sliceTag] : null;

    const newSlide: Slide = {
      id: newId,
      title: sliceInfo ? `Napkin: ${sliceInfo.label}` : `Napkin Slide ${project.slides.length + 1}`,
      sliceTag,
      questionPrompt: sliceInfo ? sliceInfo.question : 'What is the visual story here?',
      notes: sliceInfo ? sliceInfo.purpose : '',
      paperTexture: 'napkin',
      elements: [],
    };

    pushHistory({
      ...project,
      slides: [...project.slides, newSlide],
      activeSlideId: newId,
    });
    setSelectedElementId(null);
    setActiveGuidedFrameworkId(null);
    showNotification(`✨ Added new ${sliceTag ? sliceInfo?.label : 'napkin'} slide!`);
  };

  const handleDuplicateSlide = (id: string) => {
    const slideToCopy = project.slides.find((s) => s.id === id);
    if (!slideToCopy) return;

    const newId = 'slide_' + Math.random().toString(36).substring(2, 9);
    const duplicatedSlide: Slide = {
      ...JSON.parse(JSON.stringify(slideToCopy)),
      id: newId,
      title: `${slideToCopy.title} (Copy)`,
    };

    const targetIdx = project.slides.findIndex((s) => s.id === id);
    const newSlides = [...project.slides];
    newSlides.splice(targetIdx + 1, 0, duplicatedSlide);

    pushHistory({
      ...project,
      slides: newSlides,
      activeSlideId: newId,
    });
    showNotification('📋 Duplicated napkin slide!');
  };

  const handleDeleteSlide = (id: string) => {
    if (project.slides.length <= 1) return;
    const filtered = project.slides.filter((s) => s.id !== id);
    const newActiveId =
      project.activeSlideId === id ? filtered[0].id : project.activeSlideId;

    pushHistory({
      ...project,
      slides: filtered,
      activeSlideId: newActiveId,
    });
    showNotification('🗑️ Removed napkin slide.');
  };

  const handleUpdateSlideTitle = (id: string, title: string) => {
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === id ? { ...s, title } : s)),
    }));
  };

  // Select Framework from Goal Start Modal
  const handleSelectFrameworkFromGoal = useCallback(
    (frameworkId: FrameworkId, userGoalPrompt?: string, openGuided?: boolean) => {
      const def = FRAMEWORKS_REGISTRY[frameworkId];
      if (!def) return;

      const generated = def.generateElements(userGoalPrompt || def.name, userGoalPrompt);
      const newId = 'slide_' + Math.random().toString(36).substring(2, 9);

      const newSlide: Slide = {
        id: newId,
        title: userGoalPrompt ? `${def.name}: ${userGoalPrompt.substring(0, 24)}...` : def.name,
        sliceTag: def.sixSliceMapping,
        frameworkId,
        questionPrompt: def.guidedSteps[0]?.question || def.tagline,
        notes: def.purpose,
        paperTexture: 'napkin',
        elements: generated,
      };

      pushHistory({
        ...project,
        slides: [...project.slides, newSlide],
        activeSlideId: newId,
      });

      if (openGuided && def.guidedSteps.length > 0) {
        setActiveGuidedFrameworkId(frameworkId);
      }
      showNotification(`✨ Started ${def.name}!`);
    },
    [project, pushHistory, showNotification]
  );

  // Insert Framework from Library
  const handleInsertFrameworkFromLibrary = useCallback(
    (frameworkId: FrameworkId, asNewSlide: boolean, startGuided?: boolean) => {
      const def = FRAMEWORKS_REGISTRY[frameworkId];
      if (!def) return;

      const generated = def.generateElements(def.name);

      if (asNewSlide) {
        const newId = 'slide_' + Math.random().toString(36).substring(2, 9);
        const newSlide: Slide = {
          id: newId,
          title: def.name,
          sliceTag: def.sixSliceMapping,
          frameworkId,
          questionPrompt: def.guidedSteps[0]?.question || def.tagline,
          notes: def.purpose,
          paperTexture: 'napkin',
          elements: generated,
        };

        pushHistory({
          ...project,
          slides: [...project.slides, newSlide],
          activeSlideId: newId,
        });
      } else {
        handleElementsChange([...activeSlide.elements, ...generated]);
      }

      if (startGuided && def.guidedSteps.length > 0) {
        setActiveGuidedFrameworkId(frameworkId);
      }
      showNotification(`✨ Loaded ${def.name} framework!`);
    },
    [activeSlide.elements, handleElementsChange, project, pushHistory, showNotification]
  );

  // Apply SQVID representation
  const handleApplySqvid = useCallback(
    (elements: CanvasElement[], asNewSlide: boolean, title: string) => {
      if (asNewSlide) {
        const newId = 'slide_' + Math.random().toString(36).substring(2, 9);
        const newSlide: Slide = {
          id: newId,
          title,
          sliceTag: 'where',
          frameworkId: 'sqvid',
          questionPrompt: 'SQVID 5 Levers: Contrast alternative perspectives.',
          notes: 'Generated via Dan Roam SQVID Exploration Studio.',
          paperTexture: 'napkin',
          elements,
        };

        pushHistory({
          ...project,
          slides: [...project.slides, newSlide],
          activeSlideId: newId,
        });
      } else {
        handleElementsChange([...activeSlide.elements, ...elements]);
      }
      showNotification('🧭 Applied SQVID representation to canvas!');
    },
    [activeSlide.elements, handleElementsChange, project, pushHistory, showNotification]
  );

  // Open Framework Switch Modal with optional preselected target framework
  const handleOpenFrameworkSwitch = useCallback((targetId?: FrameworkId) => {
    setTargetFrameworkForSwitch(targetId);
    setIsFrameworkSwitchOpen(true);
  }, []);

  // Confirm Framework Switch Transformation
  const handleConfirmFrameworkSwitch = useCallback(
    (transformedElements: CanvasElement[], targetFrameworkId: FrameworkId, asNewSlide: boolean) => {
      const targetDef = FRAMEWORKS_REGISTRY[targetFrameworkId];

      if (asNewSlide) {
        const newId = 'slide_' + Math.random().toString(36).substring(2, 9);
        const newSlide: Slide = {
          id: newId,
          title: `${targetDef.name} (Transformed)`,
          sliceTag: targetDef.sixSliceMapping,
          frameworkId: targetFrameworkId,
          questionPrompt: targetDef.guidedSteps[0]?.question || targetDef.tagline,
          notes: `Transformed from ${activeSlide.title}`,
          paperTexture: activeSlide.paperTexture,
          elements: transformedElements,
        };

        pushHistory({
          ...project,
          slides: [...project.slides, newSlide],
          activeSlideId: newId,
        });
      } else {
        const updatedSlides = project.slides.map((s) =>
          s.id === project.activeSlideId
            ? {
                ...s,
                frameworkId: targetFrameworkId,
                title: targetDef.name,
                sliceTag: targetDef.sixSliceMapping,
                questionPrompt: targetDef.guidedSteps[0]?.question || targetDef.tagline,
                notes: s.notes
                  ? `${s.notes}\n[Transformed to ${targetDef.name}]`
                  : `Transformed to ${targetDef.name}`,
                elements: transformedElements,
              }
            : s
        );
        pushHistory({
          ...project,
          slides: updatedSlides,
        });
      }

      if (targetDef.guidedSteps.length > 0) {
        setActiveGuidedFrameworkId(targetFrameworkId);
      }
      showNotification(`🔄 Transformed diagram into ${targetDef.name}! All nodes preserved.`);
    },
    [activeSlide.paperTexture, activeSlide.title, project, pushHistory, showNotification]
  );

  // Contextual Thinking Actions on element selection (Section 11)
  const handleApplyContextAction = useCallback(
    (actionId: string, element: CanvasElement) => {
      const elX = 'x' in element ? element.x : 240;
      const elY = 'y' in element ? element.y : 220;
      const elText = 'text' in element && element.text ? element.text : 'Selected Idea';

      const newElements: CanvasElement[] = [];

      if (actionId === 'break_questions') {
        const q1Text = `Why does: ${elText.substring(0, 22)}...?`;
        const q2Text = `How can we validate: ${elText.substring(0, 22)}...?`;

        const s1: ShapeElement = {
          id: 'ctx_q1_' + Math.random().toString(36).substring(2, 9),
          type: 'shape',
          shapeType: 'rect',
          x: elX + 220,
          y: Math.max(60, elY - 40),
          width: 190,
          height: 70,
          color: '#0369a1',
          fillColor: '#f0f9ff',
          strokeWidth: 2,
          isRough: true,
          text: q1Text,
          fontSize: 13,
          tag: 'question',
        };

        const s2: ShapeElement = {
          id: 'ctx_q2_' + Math.random().toString(36).substring(2, 9),
          type: 'shape',
          shapeType: 'rect',
          x: elX + 220,
          y: elY + 60,
          width: 190,
          height: 70,
          color: '#0369a1',
          fillColor: '#f0f9ff',
          strokeWidth: 2,
          isRough: true,
          text: q2Text,
          fontSize: 13,
          tag: 'question',
        };

        const c1 = createConnector(element.id, s1.id, { x: elX + 100, y: elY + 30 }, { x: elX + 220, y: elY - 5 });
        const c2 = createConnector(element.id, s2.id, { x: elX + 100, y: elY + 50 }, { x: elX + 220, y: elY + 95 });

        newElements.push(s1, s2, c1, c2);
        showNotification('❓ Broken into 2 sub-questions connected to your node!');
      } else if (actionId === 'explore_causes') {
        const c1Text = `Contributing factor in ${elText.substring(0, 18)}`;
        const c2Text = `Technical or environment limit`;

        const s1 = createStickyNote(elX - 220, Math.max(60, elY - 40), c1Text, 'SUSPECTED CAUSE', '#fef9c3', '#d97706');
        s1.tag = 'hypothesis';
        const s2 = createStickyNote(elX - 220, elY + 60, c2Text, 'ASSUMPTION', '#f5f3ff', '#7c3aed');
        s2.tag = 'assumption';

        const conn1 = createConnector(s1.id, element.id, { x: elX - 20, y: elY - 5 }, { x: elX, y: elY + 30 });
        const conn2 = createConnector(s2.id, element.id, { x: elX - 20, y: elY + 95 }, { x: elX, y: elY + 50 });

        newElements.push(s1, s2, conn1, conn2);
        showNotification('🔍 Added 2 contributing cause hypotheses connected to your node!');
      } else if (actionId === 'turn_into_action') {
        const actionNode: ShapeElement = {
          id: 'ctx_act_' + Math.random().toString(36).substring(2, 9),
          type: 'shape',
          shapeType: 'bubble',
          x: elX + 220,
          y: elY,
          width: 210,
          height: 85,
          color: '#059669',
          fillColor: '#d1fae5',
          strokeWidth: 2,
          isRough: true,
          text: `ACTION ITEM:\nValidate ${elText.substring(0, 20)}`,
          fontSize: 14,
          tag: 'action',
        };

        const conn = createConnector(element.id, actionNode.id, { x: elX + 100, y: elY + 40 }, { x: elX + 220, y: elY + 40 }, 'Next step');

        newElements.push(actionNode, conn);
        showNotification('⚡ Created connected next action item!');
      }

      handleElementsChange([...activeSlide.elements, ...newElements]);
    },
    [activeSlide.elements, handleElementsChange, showNotification]
  );

  // Add 6 Slices Model
  const handleInsertModel = (kind: any, category: SixSliceType) => {
    const canvasCenterX = (-pan.x + window.innerWidth / 2) / zoom - 200;
    const canvasCenterY = (-pan.y + window.innerHeight / 2) / zoom - 150;

    const newModel = createModelElement(kind, category, Math.max(40, canvasCenterX), Math.max(40, canvasCenterY), currentColor);
    handleElementsChange([...activeSlide.elements, newModel]);
    setSelectedElementId(newModel.id);
    setCurrentTool('select');
    showNotification(`🧩 Inserted ${newModel.title}! Click to reposition or edit values.`);
  };

  // Add Sticky Note
  const handleAddStickyNote = () => {
    const canvasCenterX = (-pan.x + window.innerWidth / 2) / zoom - 100;
    const canvasCenterY = (-pan.y + window.innerHeight / 2) / zoom - 90;

    const sticky = createStickyNote(Math.max(40, canvasCenterX), Math.max(40, canvasCenterY));
    handleElementsChange([...activeSlide.elements, sticky]);
    setSelectedElementId(sticky.id);
    setCurrentTool('select');
    showNotification('📝 Added sticky note! Double click or use inspector to edit.');
  };

  // Insert Stamp
  const handleInsertStamp = (icon: string, label: string) => {
    const canvasCenterX = (-pan.x + window.innerWidth / 2) / zoom - 30;
    const canvasCenterY = (-pan.y + window.innerHeight / 2) / zoom - 30;

    const stamp = {
      id: 'stamp_' + Math.random().toString(36).substring(2, 9),
      type: 'stamp' as const,
      stampIcon: icon,
      x: Math.max(40, canvasCenterX),
      y: Math.max(40, canvasCenterY),
      size: 64,
      color: currentColor === '#ffffff' ? '#1e293b' : currentColor,
      label,
    };
    handleElementsChange([...activeSlide.elements, stamp]);
    setSelectedElementId(stamp.id);
    setCurrentTool('select');
    showNotification(`✨ Placed "${label}" visual stamp!`);
  };

  // Selected element operations
  const selectedElement =
    activeSlide.elements.find((e) => e.id === selectedElementId) || null;

  const handleUpdateElement = (updated: CanvasElement) => {
    handleElementsChange(
      activeSlide.elements.map((e) => (e.id === updated.id ? updated : e))
    );
  };

  const handleDeleteElement = useCallback(
    (id: string) => {
      handleElementsChange(activeSlide.elements.filter((e) => e.id !== id));
      if (selectedElementId === id) setSelectedElementId(null);
    },
    [activeSlide.elements, handleElementsChange, selectedElementId]
  );

  const handleDuplicateElement = (id: string) => {
    const el = activeSlide.elements.find((e) => e.id === id);
    if (!el) return;

    let duplicate: CanvasElement;
    if (el.type === 'shape' || el.type === 'model' || el.type === 'text' || el.type === 'stamp') {
      const dup: any = {
        ...JSON.parse(JSON.stringify(el)),
        id: 'dup_' + Math.random().toString(36).substring(2, 9),
        x: el.x + 24,
        y: el.y + 24,
      };
      if (el.type === 'shape' && el.startPoint && el.endPoint) {
        dup.startPoint = { x: el.startPoint.x + 24, y: el.startPoint.y + 24 };
        dup.endPoint = { x: el.endPoint.x + 24, y: el.endPoint.y + 24 };
      }
      duplicate = dup;
    } else if (el.type === 'connector') {
      duplicate = {
        ...JSON.parse(JSON.stringify(el)),
        id: 'dup_' + Math.random().toString(36).substring(2, 9),
        fromPoint: { x: el.fromPoint.x + 20, y: el.fromPoint.y + 20 },
        toPoint: { x: el.toPoint.x + 20, y: el.toPoint.y + 20 },
      };
    } else {
      duplicate = {
        ...JSON.parse(JSON.stringify(el)),
        id: 'dup_' + Math.random().toString(36).substring(2, 9),
        points: el.points.map((p) => ({ x: p.x + 20, y: p.y + 20 })),
      };
    }

    handleElementsChange([...activeSlide.elements, duplicate]);
    setSelectedElementId(duplicate.id);
  };

  const handleBringToFront = (id: string) => {
    const el = activeSlide.elements.find((e) => e.id === id);
    if (!el) return;
    handleElementsChange([...activeSlide.elements.filter((e) => e.id !== id), el]);
  };

  const handleSendToBack = (id: string) => {
    const el = activeSlide.elements.find((e) => e.id === id);
    if (!el) return;
    handleElementsChange([el, ...activeSlide.elements.filter((e) => e.id !== id)]);
  };

  // Export Slide as PNG
  const handleExportPng = useCallback(() => {
    exportSlideToPng(activeSlide, { scale: 1.5 });
    showNotification('📸 Exported current slide as PNG image!');
  }, [activeSlide, showNotification]);

  // Export Project File (.napkin or .json)
  const handleSaveFile = useCallback((format: 'napkin' | 'json' = 'napkin') => {
    exportNapkinFile(project, format);
    setIsDirty(false);
    showNotification(`💾 Saved project deck as .${format}!`);
  }, [project, showNotification]);

  // Quick Save Project (using File System Access API when available, or download fallback)
  const handleSaveProject = useCallback(async () => {
    try {
      saveToLocalStorage(project);
      const res = await saveProjectWithPicker(project, fileHandleRef.current);
      if (res.success) {
        if (res.handle) fileHandleRef.current = res.handle;
        setIsDirty(false);
        showNotification(`💾 Saved "${res.fileName}" successfully!`);
      }
    } catch (err: any) {
      console.error(err);
      showNotification('❌ Failed to save project file');
    }
  }, [project, showNotification]);

  // Open Project File
  const handleOpenFile = useCallback(async () => {
    try {
      const res = await openProjectFromFilePicker();
      if (res) {
        fileHandleRef.current = res.handle || null;
        pushHistory(res.project);
        setIsDirty(false);
        showNotification(`📂 Loaded "${res.fileName}" successfully!`);
      }
    } catch (err: any) {
      console.error(err);
      showNotification(`⚠️ Could not open file: ${err.message || 'Invalid format'}`);
    }
  }, [pushHistory, showNotification]);

  // Quick Export Deck to PDF
  const handleExportPdfQuick = useCallback(async () => {
    showNotification('📄 Generating presentation PDF...');
    try {
      await exportToPdf(project, {
        scope: 'all',
        activeSlideId: activeSlide.id,
        quality: 'hd',
        includeNotes: true,
      });
      showNotification('📄 Successfully exported presentation PDF!');
    } catch (err: any) {
      console.error(err);
      showNotification(`❌ PDF export failed: ${err.message || 'Error'}`);
    }
  }, [activeSlide.id, project, showNotification]);

  // Quick Export Deck to PowerPoint (.pptx)
  const handleExportPptxQuick = useCallback(async () => {
    showNotification('📊 Generating PowerPoint presentation (.pptx)...');
    try {
      await exportToPptx(project, {
        scope: 'all',
        activeSlideId: activeSlide.id,
      });
      showNotification('📊 Successfully exported PowerPoint presentation (.pptx)!');
    } catch (err: any) {
      console.error(err);
      showNotification(`❌ PPT export failed: ${err.message || 'Error'}`);
    }
  }, [activeSlide.id, project, showNotification]);

  const handleNewDeck = useCallback(() => {
    if (isDirty && !window.confirm('Start a new blank deck? Any unsaved changes will be lost.')) {
      return;
    }
    const blankSlide: Slide = {
      id: 'slide_' + Math.random().toString(36).substring(2, 9),
      title: 'Napkin Slide 1',
      questionPrompt: 'What is the visual story here?',
      notes: '',
      paperTexture: 'napkin',
      elements: [],
    };
    const newProject: ProjectState = {
      title: 'Untitled Napkin Deck',
      slides: [blankSlide],
      activeSlideId: blankSlide.id,
    };
    pushHistory(newProject);
    fileHandleRef.current = null;
    setIsDirty(false);
    setSelectedElementId(null);
    setActiveGuidedFrameworkId(null);
    showNotification('✨ Started a new blank napkin deck!');
  }, [isDirty, pushHistory, showNotification]);

  const handleExportSvg = useCallback(() => {
    exportSlideToSvg(activeSlide);
    showNotification('📐 Exported current slide as SVG!');
  }, [activeSlide, showNotification]);

  const handleExportZip = useCallback(async () => {
    showNotification('📦 Preparing ZIP archive of all slides...');
    try {
      await exportDeckToZip(project);
      showNotification('📦 Exported slide deck as ZIP archive!');
    } catch (err: any) {
      showNotification(`❌ ZIP export failed: ${err.message || 'Error'}`);
    }
  }, [project, showNotification]);

  const handleExportMarkdown = useCallback(() => {
    exportNotesToMarkdown(project);
    showNotification('📝 Exported slide notes as Markdown outline!');
  }, [project, showNotification]);

  const handleResetProject = useCallback(() => {
    const fresh = getInitialProject();
    pushHistory(fresh);
    fileHandleRef.current = null;
    setIsDirty(false);
    setSelectedElementId(null);
    setActiveGuidedFrameworkId(null);
    showNotification('Restored fresh visual thinking deck!');
  }, [pushHistory, showNotification]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveProject();
        return;
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleOpenFile();
        return;
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setIsExportOpen(true);
        return;
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          handleDeleteElement(selectedElementId);
        }
      } else if (e.key === 'v' || e.key === 'V') {
        setCurrentTool('select');
      } else if (e.key === 'p' || e.key === 'P') {
        setCurrentTool('pen');
      } else if (e.key === 'h' || e.key === 'H') {
        setCurrentTool('highlighter');
      } else if (e.key === 'a' || e.key === 'A') {
        setCurrentTool('smart');
        showNotification('🪄 Smart Assistant Draw active! Scribbles will auto-snap to shapes.');
      } else if (e.key === 't' || e.key === 'T') {
        setCurrentTool('text');
      } else if (e.key === 'c' || e.key === 'C') {
        setCurrentTool('connector');
        showNotification('🔗 Connector Arrow active! Drag between ideas to connect.');
      } else if (e.key === 'e' || e.key === 'E') {
        setCurrentTool('eraser');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleSaveProject,
    handleOpenFile,
    handleUndo,
    handleRedo,
    selectedElementId,
    showNotification,
    handleDeleteElement,
  ]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) {
          setIsDraggingFile(false);
        }
      }}
      onDrop={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith('.napkin') || file.name.endsWith('.json'))) {
          try {
            const parsed = await parseProjectFile(file);
            pushHistory(parsed);
            setIsDirty(false);
            showNotification(`📂 Opened dropped project "${file.name}"!`);
          } catch (err: any) {
            showNotification(`⚠️ Could not load file: ${err.message || 'Invalid format'}`);
          }
        }
      }}
      className="w-full h-full flex flex-col bg-stone-100 overflow-hidden relative select-none"
    >
      {/* Top Header Bar */}
      <TopBar
        projectTitle={project.title}
        onUpdateProjectTitle={(title) => {
          setProject((p) => ({ ...p, title }));
          setIsDirty(true);
        }}
        activeSlide={activeSlide}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(3, z * 1.15))}
        onZoomOut={() => setZoom((z) => Math.max(0.3, z * 0.85))}
        onResetZoom={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }}
        onOpenGoalStart={() => setIsGoalStartOpen(true)}
        onOpenFrameworkLibrary={() => setIsFrameworkLibraryOpen(true)}
        onOpenSqvidStudio={() => setIsSqvidStudioOpen(true)}
        onOpenFrameworkSwitch={() => handleOpenFrameworkSwitch()}
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
        isAssistantOpen={isAssistantOpen}
        onStartPresentation={() => setIsPresenting(true)}
        // File operations
        isDirty={isDirty}
        onNewDeck={handleNewDeck}
        onOpenFile={handleOpenFile}
        onSaveProject={handleSaveProject}
        onSaveAsFile={handleSaveFile}
        onResetProject={handleResetProject}
        // Export operations
        onOpenExportModal={() => setIsExportOpen(true)}
        onExportPdf={handleExportPdfQuick}
        onExportPptx={handleExportPptxQuick}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onExportZip={handleExportZip}
        onExportMarkdown={handleExportMarkdown}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {/* Floating Tool Controls */}
        <Toolbar
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          currentColor={currentColor}
          onSelectColor={setCurrentColor}
          strokeWidth={strokeWidth}
          onSelectStrokeWidth={setStrokeWidth}
          eraserSize={eraserSize}
          onSelectEraserSize={setEraserSize}
          onClearCanvas={handleClearSlide}
          currentShapeType={currentShapeType}
          onSelectShapeType={setCurrentShapeType}
          isRough={isRough}
          onToggleRough={() => setIsRough(!isRough)}
          paperTexture={activeSlide.paperTexture}
          onSelectPaperTexture={handleSelectPaperTexture}
          onOpenSixSlices={() => setIsSixSlicesOpen(true)}
          onOpenStamps={() => setIsStampsOpen(true)}
          onAddStickyNote={handleAddStickyNote}
        />

        {/* Selected Element Inspector with Semantic Tags & Context Actions */}
        <ElementInspector
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onApplyContextAction={handleApplyContextAction}
        />

        {/* Drawing & Modeling Canvas */}
        <NapkinCanvas
          elements={activeSlide.elements}
          onElementsChange={handleElementsChange}
          currentTool={currentTool}
          currentColor={currentColor}
          strokeWidth={strokeWidth}
          eraserSize={eraserSize}
          currentShapeType={currentShapeType}
          isRough={isRough}
          paperTexture={activeSlide.paperTexture}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          zoom={zoom}
          pan={pan}
          onPanChange={setPan}
          onQuickMessage={showNotification}
        />

        {/* Interactive Guided Thinking Step-by-Step Drawer */}
        {activeGuidedFrameworkId && (
          <GuidedThinkingDrawer
            frameworkId={activeGuidedFrameworkId}
            elements={activeSlide.elements}
            onElementsChange={handleElementsChange}
            onClose={() => setActiveGuidedFrameworkId(null)}
            onQuickMessage={showNotification}
          />
        )}

        {/* Thinking Assistant Drawer (Notes to diagram, gaps, actions) */}
        <ThinkingAssistantDrawer
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          elements={activeSlide.elements}
          onAddElements={(newEls) => handleElementsChange([...activeSlide.elements, ...newEls])}
          onQuickMessage={showNotification}
          slideTitle={activeSlide.title}
        />

        {/* Bottom Slide Deck Carousel */}
        <SlideDeck
          slides={project.slides}
          activeSlideId={project.activeSlideId}
          onSelectSlide={handleSelectSlide}
          onAddSlide={handleAddSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onUpdateSlideTitle={handleUpdateSlideTitle}
          onStartPresentation={() => setIsPresenting(true)}
        />
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-stone-900/90 text-white rounded-2xl shadow-xl text-xs font-semibold backdrop-blur-md animate-in slide-in-from-bottom-2">
          {notification}
        </div>
      )}

      {/* Goal-Oriented Starter Modal */}
      <GoalStartModal
        isOpen={isGoalStartOpen}
        onClose={() => setIsGoalStartOpen(false)}
        onSelectFramework={handleSelectFrameworkFromGoal}
        onStartBlank={() => {
          handleAddSlide();
        }}
        onOpenLibrary={() => setIsFrameworkLibraryOpen(true)}
      />

      {/* Visual Frameworks Library Modal (25+ templates in 5 categories) */}
      <FrameworkLibraryModal
        isOpen={isFrameworkLibraryOpen}
        onClose={() => setIsFrameworkLibraryOpen(false)}
        onInsertFramework={handleInsertFrameworkFromLibrary}
        onOpenSqvidStudio={() => setIsSqvidStudioOpen(true)}
        onSwitchToFramework={(fId) => handleOpenFrameworkSwitch(fId)}
      />

      {/* Dan Roam SQVID Visual Exploration Studio */}
      <SqvidStudioModal
        isOpen={isSqvidStudioOpen}
        onClose={() => setIsSqvidStudioOpen(false)}
        onApplyElements={handleApplySqvid}
        initialTopic={activeSlide.title}
      />

      {/* Framework Switcher & Transformation Modal */}
      <FrameworkSwitchModal
        isOpen={isFrameworkSwitchOpen}
        onClose={() => {
          setIsFrameworkSwitchOpen(false);
          setTargetFrameworkForSwitch(undefined);
        }}
        currentElements={activeSlide.elements}
        currentSlideTitle={activeSlide.title}
        currentFrameworkId={activeSlide.frameworkId}
        initialTargetId={targetFrameworkForSwitch}
        onConfirmSwitch={handleConfirmFrameworkSwitch}
      />

      {/* 6 Slices Thinking Modal (Preserved & accessible) */}
      <SixSlicesModal
        isOpen={isSixSlicesOpen}
        onClose={() => setIsSixSlicesOpen(false)}
        onInsertModel={handleInsertModel}
        onCreateSliceSlide={(slice) => {
          handleAddSlide(slice);
        }}
      />

      {/* Visual Vocabulary Stamps Modal (Preserved & accessible) */}
      <VisualVocabularyModal
        isOpen={isStampsOpen}
        onClose={() => setIsStampsOpen(false)}
        onInsertStamp={handleInsertStamp}
      />

      {/* Fullscreen Presentation Mode */}
      {isPresenting && (
        <PresentationMode
          slides={project.slides}
          initialSlideIndex={project.slides.findIndex((s) => s.id === project.activeSlideId)}
          onClose={() => setIsPresenting(false)}
        />
      )}

      {/* Export & Save Center Modal */}
      <ExportModal
        project={project}
        activeSlide={activeSlide}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onShowNotification={showNotification}
      />

      {/* Drag & Drop File Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-blue-600/15 backdrop-blur-xs border-4 border-dashed border-blue-500 m-4 rounded-3xl flex items-center justify-center pointer-events-none animate-in fade-in duration-100">
          <div className="bg-white/95 backdrop-blur-md px-6 py-5 rounded-2xl shadow-2xl flex items-center gap-3.5 border border-blue-200">
            <FolderOpen size={32} className="text-blue-600 animate-bounce" />
            <div>
              <div className="text-sm font-bold text-stone-900 font-['Outfit']">
                Drop Napkin Project Here
              </div>
              <div className="text-xs text-stone-500">
                Supports .napkin and .json slide deck files
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
