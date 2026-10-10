import React, { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import {
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronUp,
  Compass,
  Tablet,
  Sliders,
} from 'lucide-react';
import type {
  CanvasElement,
  PaperTexture,
  Point,
  ShapeElement,
  ShapeType,
  StrokeElement,
  StylusSettings,
  TextElement,
  Tool,
  ConnectorElement,
} from '../types';
import {
  DEFAULT_STYLUS_SETTINGS,
  applyPressureCurve,
  applyStreamlineToPoint,
  isEraserPointer,
  isBarrelButton,
  isPalmContact,
} from '../utils/stylusManager';
import {
  renderBackground,
  renderConnector,
  renderModel,
  renderShape,
  renderStamp,
  renderStroke,
  renderText,
  NAPKIN_WORLD_WIDTH,
  NAPKIN_WORLD_HEIGHT,
} from '../utils/canvasRenderer';
import { recognizeRoughShape } from '../utils/shapeRecognizer';
import {
  rotatePoint,
  getElementBounds,
  getSelectionBounds,
  testElementIntersect,
  testElementInRect,
  offsetElement,
  getResizeCursor,
  type Bounds,
} from '../utils/elementGeometry';

export type SelectionHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'rotate'
  | 'arrow_start'
  | 'arrow_end'
  | 'conn_from'
  | 'conn_to';

interface NapkinCanvasProps {
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  currentTool: Tool;
  onSelectTool?: (tool: Tool) => void;
  currentColor: string;
  strokeWidth: number;
  eraserSize?: number;
  currentShapeType: ShapeType;
  isRough: boolean;
  paperTexture: PaperTexture;
  selectedElementId?: string | null;
  selectedElementIds?: string[];
  onSelectElement?: (id: string | null) => void;
  onSelectElements?: (ids: string[]) => void;
  zoom: number;
  pan: { x: number; y: number };
  onZoomChange?: (zoom: number) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
  onResetZoom?: () => void;
  onFitToContent?: () => void;
  onQuickMessage?: (msg: string) => void;
  stylusSettings?: StylusSettings;
  onOpenStylusSettings?: () => void;
  onStylusSettingsChange?: (settings: StylusSettings) => void;
  onStylusTelemetry?: (info: {
    isConnected: boolean;
    livePressure: number;
    pointerType: string;
    tilt: { x: number; y: number };
  }) => void;
}

interface DragAction {
  type: 'move' | 'resize' | 'rotate' | 'endpoint' | 'marquee';
  handle?: SelectionHandle;
  startPt: Point;
  currentPt: Point;
  initialElements: Map<string, CanvasElement>;
  initialBounds: Bounds;
  initialCenter: Point;
  initialRotation: number;
  initialDragAngle: number;
  initialSelectedIds: string[];
  hasMoved?: boolean;
  isShiftClick?: boolean;
  hitGroupIds?: string[];
}

/**
 * Expand IDs to include all items sharing the same groupId
 */
function resolveGroupIds(ids: string[], allElements: CanvasElement[]): string[] {
  const result = new Set<string>(ids);
  for (const id of ids) {
    const el = allElements.find((e) => e.id === id);
    if (el?.groupId) {
      for (const other of allElements) {
        if (other.groupId === el.groupId) {
          result.add(other.id);
        }
      }
    }
  }
  return Array.from(result);
}

export const NapkinCanvas: React.FC<NapkinCanvasProps> = ({
  elements,
  onElementsChange,
  currentTool,
  onSelectTool,
  currentColor,
  strokeWidth,
  eraserSize = 24,
  currentShapeType,
  isRough,
  paperTexture,
  selectedElementId,
  selectedElementIds,
  onSelectElement,
  onSelectElements,
  zoom,
  pan,
  onZoomChange,
  onPanChange,
  onResetZoom,
  onFitToContent,
  onQuickMessage,
  stylusSettings,
  onOpenStylusSettings,
  onStylusSettingsChange,
  onStylusTelemetry,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Stylus & Tablet Active State & Telemetry
  const effectiveStylusSettings = stylusSettings || DEFAULT_STYLUS_SETTINGS;
  const [isStylusConnected, setIsStylusConnected] = useState(false);
  const [livePressure, setLivePressure] = useState(0);
  const lastPenTimestampRef = useRef<number>(0);
  const isHardwareEraserRef = useRef(false);
  const lastPointForStreamlineRef = useRef<Point | null>(null);

  // Synchronized Selection IDs
  const activeSelectedIds = selectedElementIds ?? (selectedElementId ? [selectedElementId] : []);
  const selectedIdsRef = useRef<string[]>(activeSelectedIds);
  selectedIdsRef.current = activeSelectedIds;
  useEffect(() => {
    selectedIdsRef.current = activeSelectedIds;
  }, [activeSelectedIds]);

  // High-performance refs for tracking active drawing without React state latency
  const isDrawingRef = useRef(false);
  const activePointsRef = useRef<Point[]>([]);
  const dragStartRef = useRef<Point | null>(null);
  const shapePreviewRef = useRef<ShapeElement | null>(null);
  const connectorPreviewRef = useRef<ConnectorElement | null>(null);

  // Live ref to elements for synchronized drag-erasing/moving without React cycle lag
  const elementsRef = useRef<CanvasElement[]>(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  // Selection Drag & Transform Action State
  const dragActionRef = useRef<DragAction | null>(null);

  // Eraser gesture refs
  const isErasingRef = useRef(false);
  const lastEraserPtRef = useRef<Point | null>(null);
  const hasErasedInSessionRef = useRef(false);
  const hoveredEraserIdRef = useRef<string | null>(null);
  const eraserCursorRef = useRef<HTMLDivElement | null>(null);

  // Cursor hover state
  const [hoverCursor, setHoverCursor] = useState<string>('default');

  // Napkin eraser crumb / dust particles
  interface EraserParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    color: string;
  }
  const particlesRef = useRef<EraserParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Pan canvas refs
  const isPanningRef = useRef(false);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });

  // Multi-touch tracking for pinch-to-zoom & two-finger pan
  const activePointersRef = useRef<Map<number, Point>>(new Map());
  const pinchStartRef = useRef<{
    dist: number;
    zoom: number;
    midpoint: Point;
    pan: Point;
  } | null>(null);

  // Spacebar tracking for quick panning
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const isSpacePressedRef = useRef(false);

  // Navigation HUD state
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);

  // Live visual pan/zoom status indicator
  const [isActivelyPanning, setIsActivelyPanning] = useState(false);
  const panIndicatorTimeoutRef = useRef<any>(null);

  const triggerPanIndicator = useCallback(() => {
    setIsActivelyPanning(true);
    if (panIndicatorTimeoutRef.current) clearTimeout(panIndicatorTimeoutRef.current);
    panIndicatorTimeoutRef.current = setTimeout(() => {
      setIsActivelyPanning(false);
    }, 1200);
  }, []);

  const redrawRef = useRef<() => void>(() => {});

  // Update selected IDs and notify parent
  const updateSelection = useCallback(
    (ids: string[]) => {
      selectedIdsRef.current = ids;
      if (onSelectElements) {
        onSelectElements(ids);
      } else if (onSelectElement) {
        onSelectElement(ids[0] || null);
      }
      redrawRef.current();
    },
    [onSelectElement, onSelectElements]
  );

  // Space key listener for temporary pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        isSpacePressedRef.current = true;
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // State only for UI triggers (inline text editor, etc.)
  const [editingText, setEditingText] = useState<{
    id?: string;
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // Screen to canvas world coordinates
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number): Point => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      return {
        x: (screenX - pan.x) / zoom,
        y: (screenY - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // Screen to canvas world coordinates with full stylus pressure & tilt extraction
  const getCanvasPointFromEvent = useCallback(
    (e: PointerEvent | React.PointerEvent<HTMLCanvasElement>): Point => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const pointerType = (e as any).pointerType as 'pen' | 'touch' | 'mouse';
      const rawPressure = e.pressure !== undefined ? e.pressure : 0.5;

      let pressure: number | undefined = undefined;
      if (pointerType === 'pen') {
        const pVal = rawPressure > 0 ? rawPressure : 0.5;
        pressure = effectiveStylusSettings.pressureEnabled
          ? applyPressureCurve(pVal, effectiveStylusSettings.pressureCurve)
          : 0.5;
      } else if (rawPressure > 0 && Math.abs(rawPressure - 0.5) > 0.03 && effectiveStylusSettings.pressureEnabled) {
        pressure = applyPressureCurve(rawPressure, effectiveStylusSettings.pressureCurve);
      }

      return {
        x: (screenX - pan.x) / zoom,
        y: (screenY - pan.y) / zoom,
        pressure,
        tiltX: e.tiltX,
        tiltY: e.tiltY,
        twist: e.twist,
        pointerType,
      };
    },
    [pan, zoom, effectiveStylusSettings]
  );

  // Effective eraser radius in canvas world coordinates
  const getEffectiveEraserRadius = useCallback(() => {
    return Math.max(16, (eraserSize || 24) / (2 * zoom));
  }, [eraserSize, zoom]);

  // Hit test for selecting elements with segment precision
  const hitTest = useCallback((pt: Point): CanvasElement | null => {
    const list = elementsRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      if (testElementIntersect(list[i], pt, 8)) {
        return list[i];
      }
    }
    return null;
  }, []);

  // Hit test all elements intersecting the eraser footprint
  const hitTestAllEraser = useCallback(
    (pt: Point, radius: number, currentList: CanvasElement[]): CanvasElement[] => {
      const hits: CanvasElement[] = [];
      for (let i = currentList.length - 1; i >= 0; i--) {
        if (testElementIntersect(currentList[i], pt, radius)) {
          hits.push(currentList[i]);
        }
      }
      return hits;
    },
    []
  );

  // Hit test handles for active selection
  const hitTestHandles = useCallback(
    (pt: Point, selectedEls: CanvasElement[]): SelectionHandle | null => {
      if (selectedEls.length === 0) return null;
      const hitRadius = Math.max(10, 12 / zoom);
      const rSq = hitRadius * hitRadius;

      // Line / arrow or connector endpoints if single selected
      if (selectedEls.length === 1) {
        const el = selectedEls[0];
        const b = getElementBounds(el);
        const rot = el.rotation || 0;
        if (
          el.type === 'shape' &&
          (el.shapeType === 'arrow' || el.shapeType === 'line') &&
          el.startPoint &&
          el.endPoint
        ) {
          const sp = rot ? rotatePoint(el.startPoint, { x: b.cx, y: b.cy }, rot) : el.startPoint;
          const ep = rot ? rotatePoint(el.endPoint, { x: b.cx, y: b.cy }, rot) : el.endPoint;
          if ((pt.x - sp.x) ** 2 + (pt.y - sp.y) ** 2 <= rSq) return 'arrow_start';
          if ((pt.x - ep.x) ** 2 + (pt.y - ep.y) ** 2 <= rSq) return 'arrow_end';
        }
        if (el.type === 'connector') {
          const fp = rot ? rotatePoint(el.fromPoint, { x: b.cx, y: b.cy }, rot) : el.fromPoint;
          const tp = rot ? rotatePoint(el.toPoint, { x: b.cx, y: b.cy }, rot) : el.toPoint;
          if ((pt.x - fp.x) ** 2 + (pt.y - fp.y) ** 2 <= rSq) return 'conn_from';
          if ((pt.x - tp.x) ** 2 + (pt.y - tp.y) ** 2 <= rSq) return 'conn_to';
        }
      }

      const b =
        selectedEls.length === 1
          ? getElementBounds(selectedEls[0])
          : getSelectionBounds(selectedEls);
      if (!b) return null;

      const rot = selectedEls.length === 1 ? selectedEls[0].rotation || 0 : 0;
      const cx = b.cx;
      const cy = b.cy;

      // Rotate handle check (stalk height = 26 / zoom)
      const rotUnrotated: Point = { x: cx, y: b.minY - 26 / zoom };
      const rotPos = rot ? rotatePoint(rotUnrotated, { x: cx, y: cy }, rot) : rotUnrotated;
      if ((pt.x - rotPos.x) ** 2 + (pt.y - rotPos.y) ** 2 <= (hitRadius + 3) * (hitRadius + 3)) {
        return 'rotate';
      }

      // 8 Bounding Box resize handles
      const handlePoints: { type: SelectionHandle; pt: Point }[] = [
        { type: 'nw', pt: { x: b.minX - 4, y: b.minY - 4 } },
        { type: 'ne', pt: { x: b.maxX + 4, y: b.minY - 4 } },
        { type: 'se', pt: { x: b.maxX + 4, y: b.maxY + 4 } },
        { type: 'sw', pt: { x: b.minX - 4, y: b.maxY + 4 } },
        { type: 'n', pt: { x: cx, y: b.minY - 4 } },
        { type: 's', pt: { x: cx, y: b.maxY + 4 } },
        { type: 'w', pt: { x: b.minX - 4, y: cy } },
        { type: 'e', pt: { x: b.maxX + 4, y: cy } },
      ];

      for (const h of handlePoints) {
        const hPos = rot ? rotatePoint(h.pt, { x: cx, y: cy }, rot) : h.pt;
        if ((pt.x - hPos.x) ** 2 + (pt.y - hPos.y) ** 2 <= rSq) {
          return h.type;
        }
      }

      return null;
    },
    [zoom]
  );

  // Redraw all elements, background, selections, and handles
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    renderBackground(ctx, canvas.width, canvas.height, paperTexture);

    // Canvas zoom & pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const rc = rough.canvas(canvas);

    // Committed elements
    const currentElements = elementsRef.current;
    for (const el of currentElements) {
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

    // Active shape drag preview
    if (shapePreviewRef.current) {
      renderShape(ctx, rc, shapePreviewRef.current);
    }

    // Active connector drag preview
    if (connectorPreviewRef.current) {
      renderConnector(ctx, rc, connectorPreviewRef.current);
    }

    // Active freehand stroke
    if (activePointsRef.current.length > 0) {
      const activeStroke: StrokeElement = {
        id: 'active_stroke',
        type: 'stroke',
        tool: currentTool === 'highlighter' ? 'highlighter' : 'pen',
        points: activePointsRef.current,
        color: currentColor,
        width: strokeWidth,
        isRough: isRough,
      };
      renderStroke(ctx, activeStroke);
    }

    // Active Marquee selection box
    if (dragActionRef.current?.type === 'marquee') {
      const { startPt, currentPt } = dragActionRef.current;
      const minX = Math.min(startPt.x, currentPt.x);
      const maxX = Math.max(startPt.x, currentPt.x);
      const minY = Math.min(startPt.y, currentPt.y);
      const maxY = Math.max(startPt.y, currentPt.y);
      const mw = maxX - minX;
      const mh = maxY - minY;

      ctx.save();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5 / zoom;
      ctx.setLineDash([4 / zoom, 4 / zoom]);
      ctx.fillRect(minX, minY, mw, mh);
      ctx.strokeRect(minX, minY, mw, mh);
      ctx.restore();
    }

    // Render Selection Highlights & Handles
    const selectedIds = selectedIdsRef.current;
    const selectedEls = currentElements.filter((e) => selectedIds.includes(e.id));

    if (selectedEls.length > 0) {
      // 1. If multi-selection, draw subtle dashed outline for each element
      if (selectedEls.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1 / zoom;
        ctx.setLineDash([3 / zoom, 3 / zoom]);
        for (const el of selectedEls) {
          const b = getElementBounds(el);
          ctx.save();
          if (el.rotation) {
            ctx.translate(b.cx, b.cy);
            ctx.rotate(el.rotation);
            ctx.translate(-b.cx, -b.cy);
          }
          ctx.strokeRect(b.minX - 3, b.minY - 3, b.width + 6, b.height + 6);
          ctx.restore();
        }
        ctx.restore();
      }

      // 2. Collective / Main Bounding Box & Handles
      const selBounds =
        selectedEls.length === 1
          ? getElementBounds(selectedEls[0])
          : getSelectionBounds(selectedEls);

      if (selBounds) {
        const rot = selectedEls.length === 1 ? selectedEls[0].rotation || 0 : 0;
        const cx = selBounds.cx;
        const cy = selBounds.cy;

        ctx.save();
        if (rot) {
          ctx.translate(cx, cy);
          ctx.rotate(rot);
          ctx.translate(-cx, -cy);
        }

        const bx = selBounds.minX - 4;
        const by = selBounds.minY - 4;
        const bw = selBounds.width + 8;
        const bh = selBounds.height + 8;

        // Bounding Box outline
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([]);
        ctx.strokeRect(bx, by, bw, bh);

        // Rotation stalk line
        const stalkTopY = selBounds.minY - 26 / zoom;
        ctx.beginPath();
        ctx.moveTo(cx, by);
        ctx.lineTo(cx, stalkTopY);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1.5 / zoom;
        ctx.stroke();

        // Rotation Handle (Circle)
        const rotRadius = 5 / zoom;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.arc(cx, stalkTopY, rotRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 8 Resize Handles (Squares)
        const hSize = 8 / zoom;
        const handleCoords = [
          { x: bx, y: by }, // nw
          { x: cx, y: by }, // n
          { x: bx + bw, y: by }, // ne
          { x: bx + bw, y: cy }, // e
          { x: bx + bw, y: by + bh }, // se
          { x: cx, y: by + bh }, // s
          { x: bx, y: by + bh }, // sw
          { x: bx, y: cy }, // w
        ];

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1.5 / zoom;
        for (const coord of handleCoords) {
          ctx.fillRect(coord.x - hSize / 2, coord.y - hSize / 2, hSize, hSize);
          ctx.strokeRect(coord.x - hSize / 2, coord.y - hSize / 2, hSize, hSize);
        }

        // Group Badge if all elements share a groupId
        const firstGroupId = selectedEls[0]?.groupId;
        const isUnifiedGroup =
          firstGroupId && selectedEls.every((e) => e.groupId === firstGroupId);

        if (isUnifiedGroup || selectedEls.length > 1) {
          const badgeText = isUnifiedGroup
            ? `📦 Group (${selectedEls.length})`
            : `${selectedEls.length} items`;
          ctx.font = `bold ${Math.max(10, 11 / zoom)}px system-ui, sans-serif`;
          const textMetrics = ctx.measureText(badgeText);
          const badgeW = textMetrics.width + 12 / zoom;
          const badgeH = 18 / zoom;
          const badgeX = bx;
          const badgeY = by - badgeH - 6 / zoom;

          ctx.fillStyle = isUnifiedGroup ? '#1e293b' : '#2563eb';
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4 / zoom);
            ctx.fill();
          } else {
            ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
          }

          ctx.fillStyle = '#ffffff';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          ctx.fillText(badgeText, badgeX + 6 / zoom, badgeY + badgeH / 2);
        }

        // Live Dimension or Angle Badge during transform
        if (dragActionRef.current?.type === 'rotate') {
          const angleDeg = Math.round(
            ((((selectedEls[0]?.rotation || 0) * 180) / Math.PI) % 360 + 360) % 360
          );
          const pillText = `${angleDeg}°`;
          ctx.font = `bold ${Math.max(10, 12 / zoom)}px system-ui, sans-serif`;
          const textW = ctx.measureText(pillText).width;
          const pillW = textW + 12 / zoom;
          const pillH = 20 / zoom;
          const pillX = cx - pillW / 2;
          const pillY = stalkTopY - pillH - 6 / zoom;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillW, pillH, 4 / zoom);
            ctx.fill();
          } else {
            ctx.fillRect(pillX, pillY, pillW, pillH);
          }
          ctx.fillStyle = '#ffffff';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillText(pillText, cx, pillY + pillH / 2);
        } else if (dragActionRef.current?.type === 'resize') {
          const dimText = `${Math.round(selBounds.width)} × ${Math.round(selBounds.height)}`;
          ctx.font = `bold ${Math.max(10, 11 / zoom)}px system-ui, sans-serif`;
          const textW = ctx.measureText(dimText).width;
          const pillW = textW + 12 / zoom;
          const pillH = 18 / zoom;
          const pillX = bx + bw - pillW;
          const pillY = by + bh + 8 / zoom;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillW, pillH, 4 / zoom);
            ctx.fill();
          } else {
            ctx.fillRect(pillX, pillY, pillW, pillH);
          }
          ctx.fillStyle = '#ffffff';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillText(dimText, pillX + pillW / 2, pillY + pillH / 2);
        }

        ctx.restore();

        // Line / Arrow / Connector specific endpoints
        if (selectedEls.length === 1) {
          const el = selectedEls[0];
          if (
            el.type === 'shape' &&
            (el.shapeType === 'arrow' || el.shapeType === 'line') &&
            el.startPoint &&
            el.endPoint
          ) {
            const rot = el.rotation || 0;
            const b = getElementBounds(el);
            const sp = rot ? rotatePoint(el.startPoint, { x: b.cx, y: b.cy }, rot) : el.startPoint;
            const ep = rot ? rotatePoint(el.endPoint, { x: b.cx, y: b.cy }, rot) : el.endPoint;
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2 / zoom;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 5 / zoom, 0, Math.PI * 2);
            ctx.arc(ep.x, ep.y, 5 / zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          } else if (el.type === 'connector') {
            const rot = el.rotation || 0;
            const b = getElementBounds(el);
            const fp = rot ? rotatePoint(el.fromPoint, { x: b.cx, y: b.cy }, rot) : el.fromPoint;
            const tp = rot ? rotatePoint(el.toPoint, { x: b.cx, y: b.cy }, rot) : el.toPoint;
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2 / zoom;
            ctx.beginPath();
            ctx.arc(fp.x, fp.y, 5 / zoom, 0, Math.PI * 2);
            ctx.arc(tp.x, tp.y, 5 / zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    // Highlight element under eraser hover
    if (currentTool === 'eraser' && hoveredEraserIdRef.current && !isErasingRef.current) {
      const hoveredEl = currentElements.find((e) => e.id === hoveredEraserIdRef.current);
      if (hoveredEl) {
        const b = getElementBounds(hoveredEl);
        ctx.save();
        if (hoveredEl.rotation) {
          ctx.translate(b.cx, b.cy);
          ctx.rotate(hoveredEl.rotation);
          ctx.translate(-b.cx, -b.cy);
        }
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
        ctx.fillRect(b.minX - 4, b.minY - 4, b.width + 8, b.height + 8);
        ctx.strokeRect(b.minX - 4, b.minY - 4, b.width + 8, b.height + 8);
        ctx.restore();
      }
    }

    // Render napkin dust / eraser crumb particles
    if (particlesRef.current.length > 0) {
      for (const p of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }, [paperTexture, zoom, pan, currentTool, currentColor, strokeWidth, isRough]);

  useEffect(() => {
    redrawRef.current = redraw;
  }, [redraw]);

  // Spawn napkin dust particles on erase
  const spawnEraserDust = useCallback(
    (x: number, y: number) => {
      const count = 6;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 2.8;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 2.5,
          alpha: 0.85,
          color: Math.random() > 0.4 ? '#fb7185' : '#cbd5e1',
        });
      }
      if (!animFrameRef.current) {
        const loop = () => {
          if (particlesRef.current.length === 0) {
            animFrameRef.current = null;
            redraw();
            return;
          }
          particlesRef.current = particlesRef.current
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vx: p.vx * 0.9,
              vy: p.vy * 0.9,
              alpha: p.alpha - 0.05,
            }))
            .filter((p) => p.alpha > 0);

          redraw();
          if (particlesRef.current.length > 0) {
            animFrameRef.current = requestAnimationFrame(loop);
          } else {
            animFrameRef.current = null;
          }
        };
        animFrameRef.current = requestAnimationFrame(loop);
      }
    },
    [redraw]
  );

  // Sync canvas size to container
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w > 0 && h > 0) {
        canvasRef.current.width = w;
        canvasRef.current.height = h;
        redraw();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  useEffect(() => {
    redraw();
  }, [elements, activeSelectedIds, redraw]);

  // POINTER DOWN
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // 1. Stylus Connection Detection & Telemetry
    if (e.pointerType === 'pen') {
      if (!isStylusConnected) {
        setIsStylusConnected(true);
        onQuickMessage?.('🖊️ Stylus / Digital Pen Detected! Pressure dynamics & palm rejection active.');
      }
      lastPenTimestampRef.current = Date.now();
      const rawP = e.pressure > 0 ? e.pressure : 0.5;
      setLivePressure(rawP);
      onStylusTelemetry?.({
        isConnected: true,
        livePressure: rawP,
        pointerType: 'pen',
        tilt: { x: e.tiltX || 0, y: e.tiltY || 0 },
      });
    }

    // 2. Smart Palm Rejection for tablets
    if (e.pointerType === 'touch' && effectiveStylusSettings.palmRejection) {
      if (isPalmContact(e)) {
        return;
      }
    }

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch detection (2 or more touches on screen -> Pinch & Pan)
    if (activePointersRef.current.size >= 2) {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        activePointsRef.current = [];
        shapePreviewRef.current = null;
        connectorPreviewRef.current = null;
        redraw();
      }
      if (isErasingRef.current) {
        isErasingRef.current = false;
        lastEraserPtRef.current = null;
      }
      dragActionRef.current = null;

      const pts = Array.from(activePointersRef.current.values());
      const p1 = pts[0];
      const p2 = pts[1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const midpoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };

      pinchStartRef.current = {
        dist: Math.max(10, dist),
        zoom,
        midpoint,
        pan: { ...pan },
      };
      return;
    }

    // 3. Tablet Finger Navigation ("Stylus Inks, Finger Navigates")
    if (e.pointerType === 'touch' && effectiveStylusSettings.fingerAction === 'pan') {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      triggerPanIndicator();
      return;
    }

    // 4. Stylus Hardware Eraser Tail or Barrel Button Eraser Action
    const isHardwareEraser =
      effectiveStylusSettings.hardwareEraserEnabled && isEraserPointer(e);
    const isBarrelEraser =
      e.pointerType === 'pen' &&
      isBarrelButton(e) &&
      effectiveStylusSettings.barrelButtonAction === 'eraser';

    if (isHardwareEraser || isBarrelEraser) {
      isHardwareEraserRef.current = true;
      isErasingRef.current = true;
      const pt = getCanvasCoords(e.clientX, e.clientY);
      lastEraserPtRef.current = pt;
      hoveredEraserIdRef.current = null;
      if (eraserCursorRef.current) {
        eraserCursorRef.current.style.transform = 'translate(-50%, -50%) scale(1.18)';
      }
      const radius = getEffectiveEraserRadius();
      const hits = hitTestAllEraser(pt, radius, elementsRef.current);
      if (hits.length > 0) {
        const hitIds = new Set(hits.map((h) => h.id));
        elementsRef.current = elementsRef.current.filter((el) => !hitIds.has(el.id));
        hasErasedInSessionRef.current = true;
        hits.forEach(() => {
          spawnEraserDust(pt.x, pt.y);
        });
        const remainingSelected = selectedIdsRef.current.filter((id) => !hitIds.has(id));
        updateSelection(remainingSelected);
        redraw();
      }
      return;
    }

    // 5. Stylus Barrel Button Pan Action
    if (
      e.pointerType === 'pen' &&
      isBarrelButton(e) &&
      effectiveStylusSettings.barrelButtonAction === 'pan'
    ) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      triggerPanIndicator();
      return;
    }

    // Pan with middle click, Space, or Hand Tool, or Alt / Shift + Left click
    if (
      e.button === 1 ||
      e.altKey ||
      isSpacePressedRef.current ||
      currentTool === 'hand' ||
      (e.button === 0 && e.shiftKey && currentTool !== 'select')
    ) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      triggerPanIndicator();
      return;
    }

    if (e.button !== 0 && !(e.pointerType === 'pen' && isBarrelButton(e))) return;

    const pt = getCanvasPointFromEvent(e);
    lastPointForStreamlineRef.current = pt;

    // Eraser Tool — Fluid Scrub / Swipe & Single Click
    if (currentTool === 'eraser') {
      isErasingRef.current = true;
      lastEraserPtRef.current = pt;
      hoveredEraserIdRef.current = null;
      if (eraserCursorRef.current) {
        eraserCursorRef.current.style.transform = 'translate(-50%, -50%) scale(1.18)';
      }
      const radius = getEffectiveEraserRadius();
      const hits = hitTestAllEraser(pt, radius, elementsRef.current);
      if (hits.length > 0) {
        const hitIds = new Set(hits.map((h) => h.id));
        elementsRef.current = elementsRef.current.filter((el) => !hitIds.has(el.id));
        hasErasedInSessionRef.current = true;
        hits.forEach(() => {
          spawnEraserDust(pt.x, pt.y);
        });
        const remainingSelected = selectedIdsRef.current.filter((id) => !hitIds.has(id));
        updateSelection(remainingSelected);
        redraw();
      }
      return;
    }

    // Select Tool — Handles, Multi-Select, Group Selection, Marquee & Move
    if (currentTool === 'select') {
      const currentSelectedEls = elementsRef.current.filter((el) =>
        selectedIdsRef.current.includes(el.id)
      );

      // 1. Check if clicking an interactive resize or rotation handle
      const hitHandle = hitTestHandles(pt, currentSelectedEls);
      if (hitHandle) {
        const selBounds =
          currentSelectedEls.length === 1
            ? getElementBounds(currentSelectedEls[0])
            : getSelectionBounds(currentSelectedEls)!;

        const initialMap = new Map<string, CanvasElement>();
        currentSelectedEls.forEach((el) => {
          initialMap.set(el.id, JSON.parse(JSON.stringify(el)));
        });

        const initialRotation =
          currentSelectedEls.length === 1 ? currentSelectedEls[0].rotation || 0 : 0;
        const initialDragAngle = Math.atan2(pt.y - selBounds.cy, pt.x - selBounds.cx);

        dragActionRef.current = {
          type:
            hitHandle === 'rotate'
              ? 'rotate'
              : hitHandle === 'arrow_start' ||
                hitHandle === 'arrow_end' ||
                hitHandle === 'conn_from' ||
                hitHandle === 'conn_to'
              ? 'endpoint'
              : 'resize',
          handle: hitHandle,
          startPt: pt,
          currentPt: pt,
          initialElements: initialMap,
          initialBounds: selBounds,
          initialCenter: { x: selBounds.cx, y: selBounds.cy },
          initialRotation,
          initialDragAngle,
          initialSelectedIds: [...selectedIdsRef.current],
        };
        redraw();
        return;
      }

      // 2. Check if clicking on an element
      const hit = hitTest(pt);
      if (hit) {
        const isShift = e.shiftKey || e.ctrlKey || e.metaKey;
        const hitGroupIds = resolveGroupIds([hit.id], elementsRef.current);

        let nextSelectedIds: string[];

        if (isShift) {
          // Toggle selection: if all elements of this group/item are already selected, deselect them; otherwise add them
          const allIn = hitGroupIds.every((id) => selectedIdsRef.current.includes(id));
          nextSelectedIds = allIn
            ? selectedIdsRef.current.filter((id) => !hitGroupIds.includes(id))
            : Array.from(new Set([...selectedIdsRef.current, ...hitGroupIds]));
          updateSelection(nextSelectedIds);
        } else {
          // If hit is not already in selection, select it (and its group)
          if (!selectedIdsRef.current.includes(hit.id)) {
            nextSelectedIds = hitGroupIds;
            updateSelection(hitGroupIds);
          } else {
            // Already in selection: keep selection intact so the user can drag all selected elements!
            nextSelectedIds = selectedIdsRef.current;
          }
        }

        // Prepare Move interaction for all currently selected elements
        const activeEls = elementsRef.current.filter((el) =>
          nextSelectedIds.includes(el.id)
        );
        const selBounds =
          activeEls.length === 1
            ? getElementBounds(activeEls[0])
            : getSelectionBounds(activeEls) || getElementBounds(hit);

        const initialMap = new Map<string, CanvasElement>();
        activeEls.forEach((el) => {
          initialMap.set(el.id, JSON.parse(JSON.stringify(el)));
        });

        dragActionRef.current = {
          type: 'move',
          startPt: pt,
          currentPt: pt,
          initialElements: initialMap,
          initialBounds: selBounds,
          initialCenter: { x: selBounds.cx, y: selBounds.cy },
          initialRotation: activeEls.length === 1 ? activeEls[0].rotation || 0 : 0,
          initialDragAngle: 0,
          initialSelectedIds: nextSelectedIds,
          hasMoved: false,
          isShiftClick: isShift,
          hitGroupIds,
        };
        redraw();
        return;
      }

      // 3. Clicked empty space on canvas -> Clear selection or start Marquee
      const isShift = e.shiftKey || e.ctrlKey || e.metaKey;
      if (!isShift) {
        updateSelection([]);
      }

      // Start Marquee drag
      dragActionRef.current = {
        type: 'marquee',
        startPt: pt,
        currentPt: pt,
        initialElements: new Map(),
        initialBounds: { minX: pt.x, minY: pt.y, maxX: pt.x, maxY: pt.y, width: 0, height: 0, cx: pt.x, cy: pt.y },
        initialCenter: pt,
        initialRotation: 0,
        initialDragAngle: 0,
        initialSelectedIds: isShift ? [...selectedIdsRef.current] : [],
      };
      redraw();
      return;
    }

    // Text Tool
    if (currentTool === 'text') {
      const hit = hitTest(pt);
      if (hit && hit.type === 'text') {
        setEditingText({
          id: hit.id,
          x: hit.x,
          y: hit.y,
          text: hit.text,
        });
      } else {
        setEditingText({
          x: pt.x,
          y: pt.y,
          text: '',
        });
      }
      return;
    }

    // Drawing Tool (Pen, Highlighter, Smart Assistant)
    if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'smart') {
      isDrawingRef.current = true;
      activePointsRef.current = [pt];
      redraw();
      return;
    }

    // Shape Tool
    if (currentTool === 'shape') {
      isDrawingRef.current = true;
      dragStartRef.current = pt;
      return;
    }

    // Connector Tool
    if (currentTool === 'connector') {
      isDrawingRef.current = true;
      dragStartRef.current = pt;
      return;
    }
  };

  // POINTER MOVE
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // 1. Stylus Telemetry & Detection
    if (e.pointerType === 'pen') {
      if (!isStylusConnected) setIsStylusConnected(true);
      lastPenTimestampRef.current = Date.now();
      const rawP = e.pressure > 0 ? e.pressure : 0.5;
      setLivePressure(rawP);
      onStylusTelemetry?.({
        isConnected: true,
        livePressure: rawP,
        pointerType: 'pen',
        tilt: { x: e.tiltX || 0, y: e.tiltY || 0 },
      });
    }

    // 2. Palm Rejection
    if (e.pointerType === 'touch' && effectiveStylusSettings.palmRejection) {
      if (isPalmContact(e)) {
        return;
      }
    }

    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Two-finger Pinch to Zoom & Pan
    if (activePointersRef.current.size >= 2 && pinchStartRef.current && canvasRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const p1 = pts[0];
      const p2 = pts[1];
      const currentDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const currentMid = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };

      const rect = canvasRef.current.getBoundingClientRect();
      const originX = pinchStartRef.current.midpoint.x - rect.left;
      const originY = pinchStartRef.current.midpoint.y - rect.top;

      const scaleRatio = currentDist / pinchStartRef.current.dist;
      const targetZoom = Math.min(5.0, Math.max(0.2, pinchStartRef.current.zoom * scaleRatio));

      const newPan = {
        x: currentMid.x - rect.left - originX * (targetZoom / pinchStartRef.current.zoom),
        y: currentMid.y - rect.top - originY * (targetZoom / pinchStartRef.current.zoom),
      };

      onZoomChange?.(targetZoom);
      onPanChange(newPan);
      triggerPanIndicator();
      return;
    }

    // Dynamic Eraser Cursor Follower (Tool eraser or Hardware Stylus Eraser)
    if (currentTool === 'eraser' || isHardwareEraserRef.current) {
      if (eraserCursorRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        eraserCursorRef.current.style.left = `${e.clientX - rect.left}px`;
        eraserCursorRef.current.style.top = `${e.clientY - rect.top}px`;
        eraserCursorRef.current.style.opacity = '1';
      }
    }

    // Canvas Panning
    if (isPanningRef.current) {
      onPanChange({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      triggerPanIndicator();
      return;
    }

    const pt = getCanvasCoords(e.clientX, e.clientY);

    // Continuous Drag / Scrub Erasing (Both Eraser tool and Hardware Stylus Eraser tip / barrel button)
    if (currentTool === 'eraser' || isHardwareEraserRef.current) {
      if (isErasingRef.current) {
        if (lastEraserPtRef.current) {
          const dist = Math.hypot(pt.x - lastEraserPtRef.current.x, pt.y - lastEraserPtRef.current.y);
          const radius = getEffectiveEraserRadius();
          const stepSize = Math.max(4, radius * 0.4);
          const steps = Math.max(1, Math.ceil(dist / stepSize));
          let currentElements = elementsRef.current;
          let anyErased = false;

          for (let s = 1; s <= steps; s++) {
            const interpPt = {
              x: lastEraserPtRef.current.x + (pt.x - lastEraserPtRef.current.x) * (s / steps),
              y: lastEraserPtRef.current.y + (pt.y - lastEraserPtRef.current.y) * (s / steps),
            };
            const hits = hitTestAllEraser(interpPt, radius, currentElements);
            if (hits.length > 0) {
              const hitIds = new Set(hits.map((h) => h.id));
              currentElements = currentElements.filter((el) => !hitIds.has(el.id));
              anyErased = true;
              hits.forEach(() => {
                spawnEraserDust(interpPt.x, interpPt.y);
              });
            }
          }

          if (anyErased) {
            elementsRef.current = currentElements;
            hasErasedInSessionRef.current = true;
            redraw();
          }
        }
        lastEraserPtRef.current = pt;
        return;
      } else {
        const radius = getEffectiveEraserRadius();
        const hits = hitTestAllEraser(pt, radius, elementsRef.current);
        const topHit = hits.length > 0 ? hits[hits.length - 1] : null;
        if (topHit?.id !== hoveredEraserIdRef.current) {
          hoveredEraserIdRef.current = topHit?.id || null;
          redraw();
        }
        return;
      }
    }

    // SELECT TOOL: Handle dragging actions (Move, Resize, Rotate, Endpoint, Marquee)
    if (currentTool === 'select' && dragActionRef.current) {
      const action = dragActionRef.current;
      action.currentPt = pt;

      // 1. MARQUEE SELECTION
      if (action.type === 'marquee') {
        const minX = Math.min(action.startPt.x, pt.x);
        const maxX = Math.max(action.startPt.x, pt.x);
        const minY = Math.min(action.startPt.y, pt.y);
        const maxY = Math.max(action.startPt.y, pt.y);
        const rect = { minX, minY, maxX, maxY };

        const hitIds: string[] = [];
        for (const el of elementsRef.current) {
          if (testElementInRect(el, rect)) {
            hitIds.push(el.id);
          }
        }
        const resolved = resolveGroupIds(hitIds, elementsRef.current);
        const combined = Array.from(new Set([...action.initialSelectedIds, ...resolved]));
        selectedIdsRef.current = combined;
        redraw();
        return;
      }

      // 2. MOVE MULTIPLE SELECTED ELEMENTS
      if (action.type === 'move') {
        const dist = Math.hypot(pt.x - action.startPt.x, pt.y - action.startPt.y);
        if (!action.hasMoved && dist < 3) {
          return;
        }
        action.hasMoved = true;

        const dx = pt.x - action.startPt.x;
        const dy = pt.y - action.startPt.y;

        elementsRef.current = elementsRef.current.map((el) => {
          const initial = action.initialElements.get(el.id);
          if (!initial) return el;
          return offsetElement(initial, dx, dy);
        });
        redraw();
        return;
      }

      // 3. ROTATE SELECTION
      if (action.type === 'rotate') {
        const center = action.initialCenter;
        const curAngle = Math.atan2(pt.y - center.y, pt.x - center.x);
        let delta = curAngle - action.initialDragAngle;

        // Shift key to snap rotation to 15 degrees
        if (e.shiftKey) {
          const totalAngle = action.initialRotation + delta;
          const snappedTotal = Math.round(totalAngle / (Math.PI / 12)) * (Math.PI / 12);
          delta = snappedTotal - action.initialRotation;
        }

        if (action.initialElements.size === 1) {
          // Single element rotation
          elementsRef.current = elementsRef.current.map((el) => {
            const initial = action.initialElements.get(el.id);
            if (!initial) return el;
            return {
              ...initial,
              rotation: ((action.initialRotation + delta) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2),
            };
          });
        } else {
          // Multi-element group rotation around collective center
          elementsRef.current = elementsRef.current.map((el) => {
            const initial = action.initialElements.get(el.id);
            if (!initial) return el;
            const b = getElementBounds(initial);
            const newCenter = rotatePoint({ x: b.cx, y: b.cy }, center, delta);
            const dx = newCenter.x - b.cx;
            const dy = newCenter.y - b.cy;
            const moved = offsetElement(initial, dx, dy);
            return {
              ...moved,
              rotation: (((initial.rotation || 0) + delta) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2),
            };
          });
        }
        redraw();
        return;
      }

      // 4. RESIZE SELECTION
      if (action.type === 'resize' && action.handle) {
        const { handle, initialBounds, initialRotation } = action;

        // Transform displacement into local coordinates if single element is rotated
        let localDx = pt.x - action.startPt.x;
        let localDy = pt.y - action.startPt.y;
        if (action.initialElements.size === 1 && initialRotation) {
          const cos = Math.cos(-initialRotation);
          const sin = Math.sin(-initialRotation);
          const rx = localDx * cos - localDy * sin;
          const ry = localDx * sin + localDy * cos;
          localDx = rx;
          localDy = ry;
        }

        let minW = 20;
        let minH = 20;
        let x1 = initialBounds.minX;
        let y1 = initialBounds.minY;
        let w1 = initialBounds.width;
        let h1 = initialBounds.height;

        if (handle === 'se') {
          w1 = Math.max(minW, initialBounds.width + localDx);
          h1 = Math.max(minH, initialBounds.height + localDy);
        } else if (handle === 'nw') {
          w1 = Math.max(minW, initialBounds.width - localDx);
          h1 = Math.max(minH, initialBounds.height - localDy);
          x1 = initialBounds.minX + (initialBounds.width - w1);
          y1 = initialBounds.minY + (initialBounds.height - h1);
        } else if (handle === 'ne') {
          w1 = Math.max(minW, initialBounds.width + localDx);
          h1 = Math.max(minH, initialBounds.height - localDy);
          y1 = initialBounds.minY + (initialBounds.height - h1);
        } else if (handle === 'sw') {
          w1 = Math.max(minW, initialBounds.width - localDx);
          h1 = Math.max(minH, initialBounds.height + localDy);
          x1 = initialBounds.minX + (initialBounds.width - w1);
        } else if (handle === 'e') {
          w1 = Math.max(minW, initialBounds.width + localDx);
        } else if (handle === 'w') {
          w1 = Math.max(minW, initialBounds.width - localDx);
          x1 = initialBounds.minX + (initialBounds.width - w1);
        } else if (handle === 's') {
          h1 = Math.max(minH, initialBounds.height + localDy);
        } else if (handle === 'n') {
          h1 = Math.max(minH, initialBounds.height - localDy);
          y1 = initialBounds.minY + (initialBounds.height - h1);
        }

        // Shift key locks aspect ratio
        if (e.shiftKey) {
          const isCorner =
            handle === 'nw' || handle === 'ne' || handle === 'se' || handle === 'sw';
          if (isCorner) {
            const scale = Math.max(w1 / initialBounds.width, h1 / initialBounds.height);
            w1 = initialBounds.width * scale;
            h1 = initialBounds.height * scale;
            if (handle === 'nw') {
              x1 = initialBounds.minX + (initialBounds.width - w1);
              y1 = initialBounds.minY + (initialBounds.height - h1);
            } else if (handle === 'ne') {
              y1 = initialBounds.minY + (initialBounds.height - h1);
            } else if (handle === 'sw') {
              x1 = initialBounds.minX + (initialBounds.width - w1);
            }
          }
        }

        const scaleX = w1 / initialBounds.width;
        const scaleY = h1 / initialBounds.height;

        // Apply scaling
        if (action.initialElements.size === 1 && initialRotation) {
          // Rotated single element: anchor center preservation
          const localCenterDelta = {
            x: x1 + w1 / 2 - initialBounds.cx,
            y: y1 + h1 / 2 - initialBounds.cy,
          };
          const worldCenterDelta = rotatePoint(localCenterDelta, { x: 0, y: 0 }, initialRotation);
          const newCenter = {
            x: initialBounds.cx + worldCenterDelta.x,
            y: initialBounds.cy + worldCenterDelta.y,
          };

          elementsRef.current = elementsRef.current.map((el) => {
            const initial = action.initialElements.get(el.id);
            if (!initial) return el;
            if (initial.type === 'shape') {
              return {
                ...initial,
                x: newCenter.x - w1 / 2,
                y: newCenter.y - h1 / 2,
                width: w1,
                height: h1,
              };
            }
            if (initial.type === 'model') {
              return {
                ...initial,
                x: newCenter.x - w1 / 2,
                y: newCenter.y - h1 / 2,
                width: w1,
                height: h1,
              };
            }
            if (initial.type === 'text') {
              return {
                ...initial,
                x: newCenter.x - w1 / 2,
                y: newCenter.y - h1 / 2,
                fontSize: Math.max(10, Math.round(initial.fontSize * Math.min(scaleX, scaleY))),
              };
            }
            if (initial.type === 'stamp') {
              return {
                ...initial,
                x: newCenter.x - w1 / 2,
                y: newCenter.y - h1 / 2,
                size: Math.max(16, Math.round(initial.size * Math.min(scaleX, scaleY))),
              };
            }
            return initial;
          });
        } else {
          // Standard / Multi-element scaling
          elementsRef.current = elementsRef.current.map((el) => {
            const initial = action.initialElements.get(el.id);
            if (!initial) return el;

            if (initial.type === 'shape') {
              if (
                (initial.shapeType === 'arrow' || initial.shapeType === 'line') &&
                initial.startPoint &&
                initial.endPoint
              ) {
                const su = (initial.startPoint.x - initialBounds.minX) / initialBounds.width;
                const sv = (initial.startPoint.y - initialBounds.minY) / initialBounds.height;
                const eu = (initial.endPoint.x - initialBounds.minX) / initialBounds.width;
                const ev = (initial.endPoint.y - initialBounds.minY) / initialBounds.height;
                const sp = { x: x1 + su * w1, y: y1 + sv * h1 };
                const ep = { x: x1 + eu * w1, y: y1 + ev * h1 };
                return {
                  ...initial,
                  startPoint: sp,
                  endPoint: ep,
                  x: Math.min(sp.x, ep.x),
                  y: Math.min(sp.y, ep.y),
                  width: Math.abs(ep.x - sp.x),
                  height: Math.abs(ep.y - sp.y),
                };
              }
              const u = (initial.x - initialBounds.minX) / initialBounds.width;
              const v = (initial.y - initialBounds.minY) / initialBounds.height;
              return {
                ...initial,
                x: x1 + u * w1,
                y: y1 + v * h1,
                width: Math.max(10, initial.width * scaleX),
                height: Math.max(10, initial.height * scaleY),
              };
            }

            if (initial.type === 'model') {
              const u = (initial.x - initialBounds.minX) / initialBounds.width;
              const v = (initial.y - initialBounds.minY) / initialBounds.height;
              return {
                ...initial,
                x: x1 + u * w1,
                y: y1 + v * h1,
                width: Math.max(20, initial.width * scaleX),
                height: Math.max(20, initial.height * scaleY),
              };
            }

            if (initial.type === 'text') {
              const u = (initial.x - initialBounds.minX) / initialBounds.width;
              const v = (initial.y - initialBounds.minY) / initialBounds.height;
              return {
                ...initial,
                x: x1 + u * w1,
                y: y1 + v * h1,
                fontSize: Math.max(10, Math.round(initial.fontSize * Math.min(scaleX, scaleY))),
              };
            }

            if (initial.type === 'stamp') {
              const u = (initial.x - initialBounds.minX) / initialBounds.width;
              const v = (initial.y - initialBounds.minY) / initialBounds.height;
              return {
                ...initial,
                x: x1 + u * w1,
                y: y1 + v * h1,
                size: Math.max(16, Math.round(initial.size * Math.min(scaleX, scaleY))),
              };
            }

            if (initial.type === 'stroke') {
              return {
                ...initial,
                points: initial.points.map((p) => ({
                  x: x1 + ((p.x - initialBounds.minX) / initialBounds.width) * w1,
                  y: y1 + ((p.y - initialBounds.minY) / initialBounds.height) * h1,
                })),
              };
            }

            if (initial.type === 'connector') {
              return {
                ...initial,
                fromPoint: {
                  x: x1 + ((initial.fromPoint.x - initialBounds.minX) / initialBounds.width) * w1,
                  y: y1 + ((initial.fromPoint.y - initialBounds.minY) / initialBounds.height) * h1,
                },
                toPoint: {
                  x: x1 + ((initial.toPoint.x - initialBounds.minX) / initialBounds.width) * w1,
                  y: y1 + ((initial.toPoint.y - initialBounds.minY) / initialBounds.height) * h1,
                },
              };
            }

            return initial;
          });
        }
        redraw();
        return;
      }

      // 5. DIRECT ENDPOINT DRAG (Line / Arrow / Connector)
      if (action.type === 'endpoint' && action.handle) {
        const handle = action.handle;
        elementsRef.current = elementsRef.current.map((el) => {
          const initial = action.initialElements.get(el.id);
          if (!initial) return el;
          if (initial.type === 'shape') {
            if (handle === 'arrow_start') {
              return { ...initial, startPoint: pt };
            }
            if (handle === 'arrow_end') {
              return { ...initial, endPoint: pt };
            }
          }
          if (initial.type === 'connector') {
            if (handle === 'conn_from') {
              return { ...initial, fromPoint: pt };
            }
            if (handle === 'conn_to') {
              return { ...initial, toPoint: pt };
            }
          }
          return initial;
        });
        redraw();
        return;
      }
    }

    // Dynamic Hover Cursor Detection for Select Tool
    if (currentTool === 'select' && !dragActionRef.current) {
      const currentSelectedEls = elementsRef.current.filter((el) =>
        selectedIdsRef.current.includes(el.id)
      );
      const hitHandle = hitTestHandles(pt, currentSelectedEls);
      if (hitHandle) {
        const rot = currentSelectedEls.length === 1 ? currentSelectedEls[0].rotation || 0 : 0;
        setHoverCursor(getResizeCursor(hitHandle, rot));
        return;
      }

      const hit = hitTest(pt);
      if (hit) {
        if (selectedIdsRef.current.includes(hit.id)) {
          setHoverCursor('move');
        } else {
          setHoverCursor('pointer');
        }
        return;
      }

      setHoverCursor('default');
    }

    if (!isDrawingRef.current) return;

    // Freehand Drawing: Add points (with 120Hz Coalesced events!) and redraw
    if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'smart') {
      const nativeEv = e.nativeEvent as any;
      const coalescedEvents: PointerEvent[] =
        nativeEv && typeof nativeEv.getCoalescedEvents === 'function'
          ? (nativeEv.getCoalescedEvents() as PointerEvent[])
          : [e.nativeEvent as PointerEvent];

      for (const subEv of coalescedEvents) {
        const rawPt = getCanvasPointFromEvent(subEv);
        const smoothedPt = applyStreamlineToPoint(
          rawPt,
          lastPointForStreamlineRef.current,
          effectiveStylusSettings.streamline
        );
        lastPointForStreamlineRef.current = smoothedPt;
        activePointsRef.current.push(smoothedPt);
      }
      redraw();
      return;
    }

    // Shape Drag Preview
    if (currentTool === 'shape' && dragStartRef.current) {
      const start = dragStartRef.current;
      const end = pt;
      const width = Math.max(1, Math.abs(end.x - start.x));
      const height = Math.max(1, Math.abs(end.y - start.y));
      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);

      shapePreviewRef.current = {
        id: 'preview',
        type: 'shape',
        shapeType: currentShapeType,
        x: currentShapeType === 'arrow' || currentShapeType === 'line' ? minX : end.x >= start.x ? start.x : end.x,
        y: currentShapeType === 'arrow' || currentShapeType === 'line' ? minY : end.y >= start.y ? start.y : end.y,
        width,
        height,
        startPoint: { x: start.x, y: start.y },
        endPoint: { x: end.x, y: end.y },
        color: currentColor,
        fillColor: 'transparent',
        strokeWidth,
        isRough,
      };
      redraw();
      return;
    }

    // Connector Drag Preview
    if (currentTool === 'connector' && dragStartRef.current) {
      connectorPreviewRef.current = {
        id: 'conn_preview',
        type: 'connector',
        fromPoint: dragStartRef.current,
        toPoint: pt,
        color: currentColor,
        strokeWidth: Math.max(2, strokeWidth),
        arrowEnd: true,
        lineStyle: 'curved',
        isRough,
      };
      redraw();
      return;
    }
  };

  // POINTER UP
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }

    // Eraser finish (Tool or Hardware Stylus Eraser)
    if (isErasingRef.current || isHardwareEraserRef.current) {
      isErasingRef.current = false;
      isHardwareEraserRef.current = false;
      lastEraserPtRef.current = null;
      if (eraserCursorRef.current) {
        eraserCursorRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      }
      if (hasErasedInSessionRef.current) {
        hasErasedInSessionRef.current = false;
        onElementsChange(elementsRef.current);
      }
      return;
    }

    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

    // Select Tool Action Commit
    if (dragActionRef.current) {
      const action = dragActionRef.current;
      dragActionRef.current = null;

      if (action.type === 'move') {
        if (action.hasMoved) {
          onElementsChange(elementsRef.current);
        } else if (!action.isShiftClick && action.hitGroupIds) {
          // Simple click on an already-selected element without Shift and without dragging:
          // collapse selection to just the clicked element / group!
          updateSelection(action.hitGroupIds);
        }
        // If !action.hasMoved && action.isShiftClick: do nothing, selection was already toggled in handlePointerDown
      } else if (action.type === 'resize' || action.type === 'rotate' || action.type === 'endpoint') {
        onElementsChange(elementsRef.current);
      } else if (action.type === 'marquee') {
        updateSelection(selectedIdsRef.current);
      }
      redraw();
      return;
    }

    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const points = [...activePointsRef.current];
    activePointsRef.current = [];

    // Freehand stroke complete
    if (points.length >= 1) {
      // Smart Assistant recognition
      if (currentTool === 'smart' && points.length >= 8) {
        const recognized = recognizeRoughShape(points);
        if (recognized && recognized.confidence > 0.6) {
          const newShape: ShapeElement = {
            id: 'shape_' + Math.random().toString(36).substring(2, 9),
            type: 'shape',
            shapeType: recognized.type,
            x: recognized.x,
            y: recognized.y,
            width: recognized.width,
            height: recognized.height,
            startPoint: recognized.startPoint,
            endPoint: recognized.endPoint,
            color: currentColor,
            fillColor: 'transparent',
            strokeWidth,
            isRough: true,
          };
          onElementsChange([...elements, newShape]);
          updateSelection([newShape.id]);
          onQuickMessage?.(`✨ Smart Assistant converted scribble into a napkin ${recognized.type}!`);
          redraw();
          return;
        }
      }

      // Standard freehand stroke with pressure sensitivity detection
      const hasPressure =
        effectiveStylusSettings.pressureEnabled &&
        points.some((p) => p.pressure !== undefined && p.pressure > 0 && Math.abs(p.pressure - 0.5) > 0.03);

      const newStroke: StrokeElement = {
        id: 'stroke_' + Math.random().toString(36).substring(2, 9),
        type: 'stroke',
        tool: currentTool === 'highlighter' ? 'highlighter' : 'pen',
        points,
        color: currentColor,
        width: strokeWidth,
        isRough,
        hasPressure,
      };
      onElementsChange([...elements, newStroke]);
      lastPointForStreamlineRef.current = null;
      redraw();
      return;
    }

    // Shape Drag Creation Complete
    if (currentTool === 'shape' && shapePreviewRef.current) {
      const preview = shapePreviewRef.current;
      shapePreviewRef.current = null;
      dragStartRef.current = null;

      const isLineLike = preview.shapeType === 'arrow' || preview.shapeType === 'line';
      const isValid = isLineLike
        ? preview.startPoint &&
          preview.endPoint &&
          Math.hypot(preview.endPoint.x - preview.startPoint.x, preview.endPoint.y - preview.startPoint.y) > 6
        : preview.width > 4 && preview.height > 4;

      if (isValid) {
        const finalShape: ShapeElement = {
          ...preview,
          id: 'shape_' + Math.random().toString(36).substring(2, 9),
        };
        onElementsChange([...elements, finalShape]);
        updateSelection([finalShape.id]);
      }
      redraw();
      return;
    }

    // Connector Creation Complete
    if (currentTool === 'connector' && connectorPreviewRef.current) {
      const preview = connectorPreviewRef.current;
      connectorPreviewRef.current = null;
      dragStartRef.current = null;

      const dist = Math.hypot(preview.toPoint.x - preview.fromPoint.x, preview.toPoint.y - preview.fromPoint.y);
      if (dist > 15) {
        const fromHit = hitTest(preview.fromPoint);
        const toHit = hitTest(preview.toPoint);
        const finalConnector: ConnectorElement = {
          ...preview,
          id: 'conn_' + Math.random().toString(36).substring(2, 9),
          fromId: fromHit?.id,
          toId: toHit?.id,
        };
        onElementsChange([...elements, finalConnector]);
        updateSelection([finalConnector.id]);
        onQuickMessage?.('🔗 Added connector! Drag handles to reposition or rotate.');
      }
      redraw();
      return;
    }
  };

  // Zoom with mouse wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(5.0, Math.max(0.2, zoom * zoomFactor));

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newPan = {
        x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
        y: mouseY - (mouseY - pan.y) * (newZoom / zoom),
      };

      onZoomChange?.(newZoom);
      onPanChange(newPan);
      triggerPanIndicator();
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, pan, onPanChange, onZoomChange, triggerPanIndicator]);

  // Commit inline text input
  const handleCommitText = () => {
    if (!editingText) return;
    const trimmed = editingText.text.trim();
    if (trimmed) {
      if (editingText.id) {
        onElementsChange(
          elements.map((el) => (el.id === editingText.id ? { ...el, text: trimmed } : el))
        );
      } else {
        const newText: TextElement = {
          id: 'text_' + Math.random().toString(36).substring(2, 9),
          type: 'text',
          x: editingText.x,
          y: editingText.y,
          text: trimmed,
          fontSize: 22,
          color: currentColor,
          fontFamily: 'Kalam',
        };
        onElementsChange([...elements, newText]);
        updateSelection([newText.id]);
      }
    }
    setEditingText(null);
  };

  // Hide eraser ring on pointer leave
  const handlePointerLeave = () => {
    if (eraserCursorRef.current) {
      eraserCursorRef.current.style.opacity = '0';
    }
    if (hoveredEraserIdRef.current) {
      hoveredEraserIdRef.current = null;
      redraw();
    }
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (currentTool === 'eraser' && eraserCursorRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      eraserCursorRef.current.style.left = `${e.clientX - rect.left}px`;
      eraserCursorRef.current.style.top = `${e.clientY - rect.top}px`;
      eraserCursorRef.current.style.opacity = '1';
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      className="relative w-full h-full overflow-hidden select-none bg-stone-100"
      style={{
        cursor:
          isSpacePressed || currentTool === 'hand'
            ? isPanningRef.current
              ? 'grabbing'
              : 'grab'
            : currentTool === 'select'
            ? hoverCursor
            : currentTool === 'eraser'
            ? 'crosshair'
            : currentTool === 'text'
            ? 'text'
            : 'crosshair',
        touchAction: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
      />

      {/* Dynamic Eraser Ring Follower */}
      {currentTool === 'eraser' && (
        <div
          ref={eraserCursorRef}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-40 transition-transform duration-75 ease-out rounded-full border-2 border-rose-500 bg-rose-500/20 backdrop-blur-[0.5px] shadow-sm shadow-rose-500/25 flex items-center justify-center"
          style={{
            width: `${Math.min(96, Math.max(14, eraserSize))}px`,
            height: `${Math.min(96, Math.max(14, eraserSize))}px`,
            left: '-100px',
            top: '-100px',
            pointerEvents: 'none',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shadow-sm" />
        </div>
      )}

      {/* Floating text editor overlay when typing */}
      {editingText && (
        <div
          className="absolute z-30"
          style={{
            left: editingText.x * zoom + pan.x,
            top: editingText.y * zoom + pan.y,
          }}
        >
          <textarea
            autoFocus
            rows={2}
            value={editingText.text}
            onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
            onBlur={handleCommitText}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCommitText();
              }
              if (e.key === 'Escape') setEditingText(null);
            }}
            placeholder="Type your napkin notes here..."
            className="p-2 bg-amber-50/95 border-2 border-amber-400 rounded-lg shadow-xl text-stone-900 font-['Kalam'] text-xl outline-none resize-both min-w-[200px]"
          />
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleCommitText}
              className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded shadow hover:bg-blue-700"
            >
              Done (Enter)
            </button>
            <button
              onClick={() => setEditingText(null)}
              className="px-2.5 py-1 text-xs font-medium bg-stone-200 text-stone-700 rounded hover:bg-stone-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Live Pan / Zoom Status Overlay Pill */}
      {isActivelyPanning && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-stone-900/80 backdrop-blur-md rounded-full text-white text-xs font-bold font-['Outfit'] shadow-lg flex items-center gap-2 pointer-events-none transition-all">
          <Compass size={13} className="text-amber-400 animate-spin" />
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      )}

      {/* Viewport Radar / Mini-Map Overlay */}
      {showMiniMap && (
        <div className="absolute bottom-44 right-6 z-30 w-48 bg-stone-900/90 backdrop-blur-md border border-stone-700/80 rounded-2xl shadow-2xl p-2.5 flex flex-col gap-2 text-white select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <span className="text-xs font-bold font-['Outfit'] flex items-center gap-1.5 text-stone-200">
              <Compass size={13} className="text-amber-400" />
              Radar Mini-Map
            </span>
            <button
              onClick={() => setShowMiniMap(false)}
              className="text-stone-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;
              const worldTargetX = (clickX / rect.width) * NAPKIN_WORLD_WIDTH;
              const worldTargetY = (clickY / rect.height) * NAPKIN_WORLD_HEIGHT;

              if (canvasRef.current) {
                const cWidth = canvasRef.current.width;
                const cHeight = canvasRef.current.height;
                onPanChange({
                  x: cWidth / 2 - worldTargetX * zoom,
                  y: cHeight / 2 - worldTargetY * zoom,
                });
                triggerPanIndicator();
              }
            }}
            className="w-full h-24 bg-stone-950/80 rounded-xl border border-stone-800 relative overflow-hidden cursor-crosshair group"
            title="Click anywhere to pan camera directly"
          >
            <div className="absolute inset-0 m-1.5 border border-amber-500/40 bg-amber-500/10 rounded" />
            {elements.map((el) => {
              const scale = 160 / NAPKIN_WORLD_WIDTH;
              const ex = ('x' in el ? el.x : 0) * scale + 6;
              const ey = ('y' in el ? el.y : 0) * scale + 6;
              return (
                <div
                  key={el.id}
                  className="absolute w-1 h-1 rounded-full bg-blue-400/80"
                  style={{ left: `${ex}px`, top: `${ey}px` }}
                />
              );
            })}
            {canvasRef.current && (
              <div
                className="absolute border-2 border-blue-400 bg-blue-500/25 rounded transition-all duration-75 pointer-events-none shadow-sm"
                style={{
                  left: `${Math.max(0, Math.min(160, (-pan.x / zoom) * (160 / NAPKIN_WORLD_WIDTH) + 6))}px`,
                  top: `${Math.max(0, Math.min(90, (-pan.y / zoom) * (100 / NAPKIN_WORLD_HEIGHT) + 6))}px`,
                  width: `${Math.max(12, (canvasRef.current.width / zoom) * (160 / NAPKIN_WORLD_WIDTH))}px`,
                  height: `${Math.max(12, (canvasRef.current.height / zoom) * (100 / NAPKIN_WORLD_HEIGHT))}px`,
                }}
              />
            )}
          </div>
          <span className="text-[10px] text-stone-400 text-center">Click radar to jump view</span>
        </div>
      )}

      {/* Floating Canvas Navigation HUD (Bottom-Right, above deck) */}
      <div className="absolute bottom-28 right-6 z-30 flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-xl shadow-stone-900/10 text-stone-700 select-none">
        <button
          onClick={() => {
            if (onSelectTool) {
              onSelectTool(currentTool === 'hand' ? 'select' : 'hand');
            }
          }}
          title={currentTool === 'hand' ? 'Exit Hand Tool (V)' : 'Pan / Hand Tool (H or hold Space)'}
          className={`p-2 rounded-xl transition-all flex items-center justify-center ${
            currentTool === 'hand'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'hover:bg-stone-100 text-stone-600'
          }`}
        >
          <Hand size={16} />
        </button>

        <div className="w-[1px] h-5 bg-stone-200" />

        <button
          onClick={() => {
            const newZoom = Math.max(0.2, zoom * 0.85);
            if (canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect();
              const cx = rect.width / 2;
              const cy = rect.height / 2;
              onPanChange({
                x: cx - (cx - pan.x) * (newZoom / zoom),
                y: cy - (cy - pan.y) * (newZoom / zoom),
              });
            }
            onZoomChange?.(newZoom);
            triggerPanIndicator();
          }}
          title="Zoom Out (Ctrl -)"
          className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
        >
          <ZoomOut size={16} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            title="Click for Zoom Presets"
            className="px-2 py-1 text-xs font-bold text-stone-800 hover:bg-stone-100 rounded-lg min-w-[50px] text-center font-['Outfit'] flex items-center justify-center gap-1"
          >
            <span>{Math.round(zoom * 100)}%</span>
            <ChevronUp size={11} className={`transition-transform text-stone-400 ${showZoomMenu ? 'rotate-180' : ''}`} />
          </button>

          {showZoomMenu && (
            <div className="absolute bottom-11 right-0 w-36 bg-white border border-stone-200 rounded-xl shadow-2xl p-1 flex flex-col gap-0.5 z-40 animate-in fade-in duration-100">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((zVal) => (
                <button
                  key={zVal}
                  onClick={() => {
                    const newZoom = zVal;
                    if (canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      const cx = rect.width / 2;
                      const cy = rect.height / 2;
                      onPanChange({
                        x: cx - (cx - pan.x) * (newZoom / zoom),
                        y: cy - (cy - pan.y) * (newZoom / zoom),
                      });
                    }
                    onZoomChange?.(newZoom);
                    setShowZoomMenu(false);
                    triggerPanIndicator();
                  }}
                  className={`px-3 py-1.5 text-xs text-left rounded-lg transition-colors font-semibold ${
                    Math.round(zoom * 100) === Math.round(zVal * 100)
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  {Math.round(zVal * 100)}%
                </button>
              ))}

              <div className="h-[1px] bg-stone-100 my-0.5" />

              <button
                onClick={() => {
                  onResetZoom?.();
                  setShowZoomMenu(false);
                  triggerPanIndicator();
                }}
                className="px-3 py-1.5 text-xs text-left rounded-lg hover:bg-stone-100 text-stone-700 font-semibold"
              >
                Reset to 100%
              </button>

              {onFitToContent && (
                <button
                  onClick={() => {
                    onFitToContent();
                    setShowZoomMenu(false);
                    triggerPanIndicator();
                  }}
                  className="px-3 py-1.5 text-xs text-left rounded-lg hover:bg-stone-100 text-stone-700 font-semibold"
                >
                  Fit to Screen
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            const newZoom = Math.min(5.0, zoom * 1.18);
            if (canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect();
              const cx = rect.width / 2;
              const cy = rect.height / 2;
              onPanChange({
                x: cx - (cx - pan.x) * (newZoom / zoom),
                y: cy - (cy - pan.y) * (newZoom / zoom),
              });
            }
            onZoomChange?.(newZoom);
            triggerPanIndicator();
          }}
          title="Zoom In (Ctrl +)"
          className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
        >
          <ZoomIn size={16} />
        </button>

        <div className="w-[1px] h-5 bg-stone-200" />

        <button
          onClick={() => {
            if (onFitToContent) onFitToContent();
            else onResetZoom?.();
            triggerPanIndicator();
          }}
          title="Fit Napkin to Screen"
          className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
        >
          <Maximize2 size={16} />
        </button>

        <div className="w-[1px] h-5 bg-stone-200" />

        <button
          onClick={() => setShowMiniMap(!showMiniMap)}
          title="Toggle Viewport Radar Mini-Map"
          className={`p-2 rounded-xl transition-all ${
            showMiniMap ? 'bg-stone-800 text-white shadow-sm' : 'hover:bg-stone-100 text-stone-600'
          }`}
        >
          <Compass size={16} />
        </button>
      </div>

      {/* Floating Stylus & Tablet HUD Pill (Bottom-Left) */}
      <div className="absolute bottom-28 left-6 z-30 flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-xl shadow-stone-900/10 text-stone-700 select-none">
        <button
          onClick={onOpenStylusSettings}
          title="Digital Pen & Tablet Studio (Configure pressure, palm rejection & streamline)"
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
            isStylusConnected
              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100/80 font-semibold'
              : 'hover:bg-stone-100 text-stone-600 font-medium'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Tablet size={16} className={isStylusConnected ? 'text-blue-600' : 'text-stone-500'} />
            {isStylusConnected && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          <span className="text-xs font-['Outfit'] hidden sm:inline">
            {isStylusConnected ? 'Stylus Active' : 'Tablet / Pen'}
          </span>
          {isStylusConnected && livePressure > 0 && (
            <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-100/80 px-1.5 py-0.5 rounded-md">
              {Math.round(livePressure * 100)}%
            </span>
          )}
        </button>

        <div className="w-[1px] h-5 bg-stone-200" />

        {/* Quick Finger Mode Switcher */}
        <button
          onClick={() => {
            const nextAction = effectiveStylusSettings.fingerAction === 'pan' ? 'draw' : 'pan';
            const updated: StylusSettings = { ...effectiveStylusSettings, fingerAction: nextAction };
            onStylusSettingsChange?.(updated);
            onQuickMessage?.(
              nextAction === 'pan'
                ? '🖐️ Tablet Mode: Finger pans & zooms canvas, digital pen draws ink'
                : '✏️ Finger Drawing Mode: Finger also draws strokes'
            );
          }}
          title={
            effectiveStylusSettings.fingerAction === 'pan'
              ? 'Finger Mode: Pan Canvas (Click to switch to Finger Draw)'
              : 'Finger Mode: Inks Canvas (Click to switch to Finger Pan)'
          }
          className={`p-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            effectiveStylusSettings.fingerAction === 'pan'
              ? 'bg-stone-100 text-stone-700 hover:bg-stone-200/70'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200/80'
          }`}
        >
          <Hand size={14} className={effectiveStylusSettings.fingerAction === 'pan' ? 'text-blue-600' : 'text-amber-600'} />
          <span className="text-[11px] hidden md:inline">
            {effectiveStylusSettings.fingerAction === 'pan' ? 'Finger Pans' : 'Finger Inks'}
          </span>
        </button>

        <div className="w-[1px] h-5 bg-stone-200" />

        {/* Studio Settings Shortcut */}
        <button
          onClick={onOpenStylusSettings}
          title="Open Digital Pen & Tablet Studio"
          className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
        >
          <Sliders size={15} />
        </button>
      </div>
    </div>
  );
};
