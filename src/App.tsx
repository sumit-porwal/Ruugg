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
  StylusSettings,
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
import { StylusSettingsModal } from './components/StylusSettingsModal';
import { loadStylusSettings, saveStylusSettings } from './utils/stylusManager';
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
  getSlideBoundingBox,
} from './utils/exportEngine';
import {
  getElementBounds,
  getSelectionBounds,
  offsetElement,
  duplicateElement,
  rotatePoint,
} from './utils/elementGeometry';
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
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const setSelectedElementId = useCallback((id: string | null) => {
    setSelectedElementIds(id ? [id] : []);
  }, []);

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

  // Digital Pen & Tablet Stylus Engine State
  const [stylusSettings, setStylusSettings] = useState<StylusSettings>(() => loadStylusSettings());
  const [isStylusModalOpen, setIsStylusModalOpen] = useState(false);
  const [stylusTelemetry, setStylusTelemetry] = useState<{
    isConnected: boolean;
    livePressure: number;
    pointerType: string;
    tilt: { x: number; y: number };
  }>({
    isConnected: false,
    livePressure: 0,
    pointerType: 'mouse',
    tilt: { x: 0, y: 0 },
  });

  const handleStylusSettingsChange = (newSettings: StylusSettings) => {
    setStylusSettings(newSettings);
    saveStylusSettings(newSettings);
  };

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

  const handleResetView = useCallback(() => {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight - 120;
    const sheetW = 1600;
    const sheetH = 1000;
    const autoZoom = Math.min(1.0, Math.max(0.35, Math.min((viewportW - 100) / sheetW, (viewportH - 100) / sheetH)));
    const newPan = {
      x: (viewportW - sheetW * autoZoom) / 2,
      y: Math.max(20, (viewportH - sheetH * autoZoom) / 2),
    };
    setZoom(autoZoom);
    setPan(newPan);
    showNotification(`Reset view to center (${Math.round(autoZoom * 100)}%)`);
  }, [showNotification]);

  const handleFitToContent = useCallback(() => {
    const bbox = getSlideBoundingBox(activeSlide);
    const hasEls = activeSlide.elements && activeSlide.elements.length > 0;
    const targetW = hasEls ? Math.max(600, bbox.width + 160) : 1600;
    const targetH = hasEls ? Math.max(400, bbox.height + 160) : 1000;
    const targetMinX = hasEls ? bbox.minX - 80 : 0;
    const targetMinY = hasEls ? bbox.minY - 80 : 0;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight - 120;

    const scaleX = viewportW / targetW;
    const scaleY = viewportH / targetH;
    const newZoom = Math.min(2.0, Math.max(0.3, Math.min(scaleX, scaleY) * 0.95));

    const newPan = {
      x: (viewportW - targetW * newZoom) / 2 - targetMinX * newZoom,
      y: (viewportH - targetH * newZoom) / 2 - targetMinY * newZoom,
    };

    setZoom(newZoom);
    setPan(newPan);
    showNotification(`🎯 Fitted view (${Math.round(newZoom * 100)}%)`);
  }, [activeSlide, showNotification]);

  // Center napkin on initial load
  useEffect(() => {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight - 120;
    const sheetW = 1600;
    const sheetH = 1000;
    const initialZoom = Math.min(1.0, Math.max(0.4, Math.min((viewportW - 120) / sheetW, (viewportH - 120) / sheetH)));
    setZoom(initialZoom);
    setPan({
      x: (viewportW - sheetW * initialZoom) / 2,
      y: Math.max(20, (viewportH - sheetH * initialZoom) / 2),
    });
  }, []);

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

  // Selected elements operations
  const selectedElements = activeSlide.elements.filter((e) => selectedElementIds.includes(e.id));
  const selectedElement = selectedElements[0] || null;

  const handleUpdateElement = (updated: CanvasElement) => {
    handleElementsChange(
      activeSlide.elements.map((e) => (e.id === updated.id ? updated : e))
    );
  };

  const handleDeleteElement = useCallback(
    (id: string) => {
      handleElementsChange(activeSlide.elements.filter((e) => e.id !== id));
      setSelectedElementIds((prev) => prev.filter((i) => i !== id));
    },
    [activeSlide.elements, handleElementsChange]
  );

  const handleDeleteElements = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      handleElementsChange(activeSlide.elements.filter((e) => !idSet.has(e.id)));
      setSelectedElementIds([]);
    },
    [activeSlide.elements, handleElementsChange]
  );

  const handleDuplicateElement = (id: string) => {
    const el = activeSlide.elements.find((e) => e.id === id);
    if (!el) return;
    const duplicate = duplicateElement(el, 24, 24);
    handleElementsChange([...activeSlide.elements, duplicate]);
    setSelectedElementIds([duplicate.id]);
  };

  const handleDuplicateElements = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      const targets = activeSlide.elements.filter((e) => idSet.has(e.id));
      if (targets.length === 0) return;

      const newElements: CanvasElement[] = [];
      const newSelectedIds: string[] = [];
      const newGroupIdMap = new Map<string, string>();

      targets.forEach((el) => {
        let newGroupId = el.groupId;
        if (el.groupId) {
          if (!newGroupIdMap.has(el.groupId)) {
            newGroupIdMap.set(el.groupId, 'grp_' + Math.random().toString(36).substring(2, 9));
          }
          newGroupId = newGroupIdMap.get(el.groupId);
        }
        const dup = duplicateElement(el, 24, 24, newGroupId);
        newElements.push(dup);
        newSelectedIds.push(dup.id);
      });

      handleElementsChange([...activeSlide.elements, ...newElements]);
      setSelectedElementIds(newSelectedIds);
      showNotification(`📋 Duplicated ${targets.length} object(s)!`);
    },
    [activeSlide.elements, handleElementsChange, showNotification]
  );

  const handleGroupSelected = useCallback(() => {
    if (selectedElementIds.length < 2) return;
    const newGroupId = 'grp_' + Math.random().toString(36).substring(2, 9);
    const updated = activeSlide.elements.map((el) =>
      selectedElementIds.includes(el.id) ? { ...el, groupId: newGroupId } : el
    );
    handleElementsChange(updated);
    showNotification(`📦 Grouped ${selectedElementIds.length} objects together!`);
  }, [selectedElementIds, activeSlide.elements, handleElementsChange, showNotification]);

  const handleUngroupSelected = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    const targetGroupIds = new Set(
      activeSlide.elements
        .filter((el) => selectedElementIds.includes(el.id) && el.groupId)
        .map((el) => el.groupId as string)
    );
    const updated = activeSlide.elements.map((el) => {
      if (selectedElementIds.includes(el.id) || (el.groupId && targetGroupIds.has(el.groupId))) {
        const copy = { ...el };
        delete copy.groupId;
        return copy;
      }
      return el;
    });
    handleElementsChange(updated);
    showNotification('🔓 Ungrouped objects.');
  }, [selectedElementIds, activeSlide.elements, handleElementsChange, showNotification]);

  const handleAlignElements = useCallback(
    (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (selectedElements.length < 2) return;
      const boundsList = selectedElements.map((e) => getElementBounds(e));
      const minX = Math.min(...boundsList.map((b) => b.minX));
      const maxX = Math.max(...boundsList.map((b) => b.maxX));
      const minY = Math.min(...boundsList.map((b) => b.minY));
      const maxY = Math.max(...boundsList.map((b) => b.maxY));
      const avgCenterX = (minX + maxX) / 2;
      const avgCenterY = (minY + maxY) / 2;

      const updated = activeSlide.elements.map((el) => {
        if (!selectedElementIds.includes(el.id)) return el;
        const b = getElementBounds(el);
        let dx = 0;
        let dy = 0;
        if (alignment === 'left') dx = minX - b.minX;
        else if (alignment === 'right') dx = maxX - b.maxX;
        else if (alignment === 'center') dx = avgCenterX - b.cx;
        else if (alignment === 'top') dy = minY - b.minY;
        else if (alignment === 'bottom') dy = maxY - b.maxY;
        else if (alignment === 'middle') dy = avgCenterY - b.cy;

        return offsetElement(el, dx, dy);
      });
      handleElementsChange(updated);
      showNotification(`Aligned objects to ${alignment}!`);
    },
    [selectedElements, selectedElementIds, activeSlide.elements, handleElementsChange, showNotification]
  );

  const handleRotateElements = useCallback(
    (deltaDegrees: number) => {
      if (selectedElements.length === 0) return;
      if (deltaDegrees === 0) {
        const updated = activeSlide.elements.map((el) =>
          selectedElementIds.includes(el.id) ? { ...el, rotation: 0 } : el
        );
        handleElementsChange(updated);
        showNotification('Reset rotation to 0°');
        return;
      }

      const deltaRad = (deltaDegrees * Math.PI) / 180;
      const selBounds = getSelectionBounds(selectedElements);
      if (!selBounds) return;

      const updated = activeSlide.elements.map((el) => {
        if (!selectedElementIds.includes(el.id)) return el;
        if (selectedElements.length === 1) {
          return {
            ...el,
            rotation: (((el.rotation || 0) + deltaRad) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2),
          };
        }
        const b = getElementBounds(el);
        const newCenter = rotatePoint({ x: b.cx, y: b.cy }, { x: selBounds.cx, y: selBounds.cy }, deltaRad);
        const dx = newCenter.x - b.cx;
        const dy = newCenter.y - b.cy;
        const moved = offsetElement(el, dx, dy);
        return {
          ...moved,
          rotation: (((moved.rotation || 0) + deltaRad) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2),
        };
      });
      handleElementsChange(updated);
    },
    [selectedElements, selectedElementIds, activeSlide.elements, handleElementsChange, showNotification]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedElementIds(activeSlide.elements.map((e) => e.id));
  }, [activeSlide.elements]);

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
  }, [isDirty, pushHistory, setSelectedElementId, showNotification]);

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
  }, [pushHistory, setSelectedElementId, showNotification]);

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
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroupSelected();
        } else {
          handleGroupSelected();
        }
        return;
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleSelectAll();
        return;
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          handleDuplicateElements(selectedElementIds);
          return;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          handleDeleteElements(selectedElementIds);
          return;
        }
      } else if (e.key === 'Escape') {
        setSelectedElementIds([]);
        return;
      } else if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 2;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          const updated = activeSlide.elements.map((el) =>
            selectedElementIds.includes(el.id) ? offsetElement(el, dx, dy) : el
          );
          handleElementsChange(updated);
          return;
        }
      } else if (e.key === 'v' || e.key === 'V') {
        setCurrentTool('select');
      } else if (e.key === 'p' || e.key === 'P') {
        setCurrentTool('pen');
      } else if (e.key === 'h' || e.key === 'H') {
        if (e.shiftKey) {
          setCurrentTool('highlighter');
        } else {
          setCurrentTool('hand');
          showNotification('✋ Hand / Pan tool active! Click & drag anywhere to move around the napkin.');
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => Math.min(5.0, z * 1.18));
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoom((z) => Math.max(0.2, z * 0.85));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleResetView();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        handleFitToContent();
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
    handleResetView,
    handleFitToContent,
    selectedElementIds,
    handleGroupSelected,
    handleUngroupSelected,
    handleSelectAll,
    handleDuplicateElements,
    handleDeleteElements,
    activeSlide.elements,
    handleElementsChange,
    showNotification,
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
        onZoomIn={() => {
          const newZoom = Math.min(5.0, zoom * 1.18);
          const cx = window.innerWidth / 2;
          const cy = (window.innerHeight - 120) / 2;
          setPan((p) => ({
            x: cx - (cx - p.x) * (newZoom / zoom),
            y: cy - (cy - p.y) * (newZoom / zoom),
          }));
          setZoom(newZoom);
        }}
        onZoomOut={() => {
          const newZoom = Math.max(0.2, zoom * 0.85);
          const cx = window.innerWidth / 2;
          const cy = (window.innerHeight - 120) / 2;
          setPan((p) => ({
            x: cx - (cx - p.x) * (newZoom / zoom),
            y: cy - (cy - p.y) * (newZoom / zoom),
          }));
          setZoom(newZoom);
        }}
        onResetZoom={handleResetView}
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
          onOpenStylusSettings={() => setIsStylusModalOpen(true)}
          isStylusActive={stylusTelemetry.isConnected}
        />

        {/* Selected Element Inspector with Semantic Tags, Multi-Select & Context Actions */}
        <ElementInspector
          selectedElement={selectedElement}
          selectedElements={selectedElements}
          onUpdateElement={handleUpdateElement}
          onUpdateElements={(updated) => {
            const map = new Map(updated.map((e) => [e.id, e]));
            handleElementsChange(activeSlide.elements.map((e) => map.get(e.id) || e));
          }}
          onDeleteElement={handleDeleteElement}
          onDeleteElements={handleDeleteElements}
          onDuplicateElement={handleDuplicateElement}
          onDuplicateElements={handleDuplicateElements}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onGroupElements={handleGroupSelected}
          onUngroupElements={handleUngroupSelected}
          onAlignElements={handleAlignElements}
          onRotateElements={handleRotateElements}
          onApplyContextAction={handleApplyContextAction}
        />

        {/* Drawing & Modeling Canvas */}
        <NapkinCanvas
          elements={activeSlide.elements}
          onElementsChange={handleElementsChange}
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          currentColor={currentColor}
          strokeWidth={strokeWidth}
          eraserSize={eraserSize}
          currentShapeType={currentShapeType}
          isRough={isRough}
          paperTexture={activeSlide.paperTexture}
          selectedElementIds={selectedElementIds}
          onSelectElements={setSelectedElementIds}
          zoom={zoom}
          pan={pan}
          onZoomChange={setZoom}
          onPanChange={setPan}
          onResetZoom={handleResetView}
          onFitToContent={handleFitToContent}
          onQuickMessage={showNotification}
          stylusSettings={stylusSettings}
          onOpenStylusSettings={() => setIsStylusModalOpen(true)}
          onStylusSettingsChange={handleStylusSettingsChange}
          onStylusTelemetry={setStylusTelemetry}
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

      {/* Digital Pen & Tablet Studio Modal */}
      <StylusSettingsModal
        isOpen={isStylusModalOpen}
        onClose={() => setIsStylusModalOpen(false)}
        settings={stylusSettings}
        onSaveSettings={handleStylusSettingsChange}
        liveStylusInfo={stylusTelemetry}
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
