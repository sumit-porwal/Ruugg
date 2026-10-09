import React, { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import type {
  CanvasElement,
  PaperTexture,
  Point,
  ShapeElement,
  ShapeType,
  StrokeElement,
  TextElement,
  Tool,
  ConnectorElement,
} from '../types';
import {
  renderBackground,
  renderConnector,
  renderModel,
  renderShape,
  renderStamp,
  renderStroke,
  renderText,
} from '../utils/canvasRenderer';
import { recognizeRoughShape } from '../utils/shapeRecognizer';

interface NapkinCanvasProps {
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  currentTool: Tool;
  currentColor: string;
  strokeWidth: number;
  eraserSize?: number;
  currentShapeType: ShapeType;
  isRough: boolean;
  paperTexture: PaperTexture;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  onQuickMessage?: (msg: string) => void;
}

// Distance from point to line segment squared
function distToSegmentSquared(
  px: number,
  py: number,
  vx: number,
  vy: number,
  wx: number,
  wy: number
): number {
  const l2 = (vx - wx) * (vx - wx) + (vy - wy) * (vy - wy);
  if (l2 === 0) return (px - vx) * (px - vx) + (py - vy) * (py - vy);
  let t = ((px - vx) * (wx - vx) + (py - vy) * (wy - vy)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = vx + t * (wx - vx);
  const projY = vy + t * (wy - vy);
  return (px - projX) * (px - projX) + (py - projY) * (py - projY);
}

export const NapkinCanvas: React.FC<NapkinCanvasProps> = ({
  elements,
  onElementsChange,
  currentTool,
  currentColor,
  strokeWidth,
  eraserSize = 24,
  currentShapeType,
  isRough,
  paperTexture,
  selectedElementId,
  onSelectElement,
  zoom,
  pan,
  onPanChange,
  onQuickMessage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // High-performance refs for tracking active drawing without React state latency
  const isDrawingRef = useRef(false);
  const activePointsRef = useRef<Point[]>([]);
  const dragStartRef = useRef<Point | null>(null);
  const shapePreviewRef = useRef<ShapeElement | null>(null);
  const connectorPreviewRef = useRef<ConnectorElement | null>(null);

  // Live ref to elements for synchronized drag-erasing without React cycle lag
  const elementsRef = useRef<CanvasElement[]>(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  // Eraser gesture refs
  const isErasingRef = useRef(false);
  const lastEraserPtRef = useRef<Point | null>(null);
  const hasErasedInSessionRef = useRef(false);
  const hoveredEraserIdRef = useRef<string | null>(null);
  const eraserCursorRef = useRef<HTMLDivElement | null>(null);

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

  // Moving existing elements
  const isDraggingElementRef = useRef(false);
  const elementDragOffsetRef = useRef<Point>({ x: 0, y: 0 });

  // Pan canvas refs
  const isPanningRef = useRef(false);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });

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

  // Effective eraser radius in canvas world coordinates
  const getEffectiveEraserRadius = useCallback(() => {
    return Math.max(16, (eraserSize || 24) / (2 * zoom));
  }, [eraserSize, zoom]);

  // Test collision between a point with radius and an element
  const testElementIntersect = (el: CanvasElement, pt: Point, radius: number): boolean => {
    if (el.type === 'shape') {
      if ((el.shapeType === 'arrow' || el.shapeType === 'line') && el.startPoint && el.endPoint) {
        const threshold = Math.max(16, radius + (el.strokeWidth || 3) * 1.5);
        return (
          distToSegmentSquared(
            pt.x,
            pt.y,
            el.startPoint.x,
            el.startPoint.y,
            el.endPoint.x,
            el.endPoint.y
          ) <=
          threshold * threshold
        );
      }
      const rx = el.x - radius;
      const ry = el.y - radius;
      const rw = (el.width || 60) + radius * 2;
      const rh = (el.height || 60) + radius * 2;
      return pt.x >= rx && pt.x <= rx + rw && pt.y >= ry && pt.y <= ry + rh;
    } else if (el.type === 'model') {
      const rx = el.x - radius;
      const ry = el.y - radius;
      const rw = (el.width || 60) + radius * 2;
      const rh = (el.height || 60) + radius * 2;
      return pt.x >= rx && pt.x <= rx + rw && pt.y >= ry && pt.y <= ry + rh;
    } else if (el.type === 'text') {
      const textLen = el.text ? el.text.length : 1;
      const w = Math.max(60, (el.fontSize || 22) * textLen * 0.65);
      const h = Math.max(30, (el.fontSize || 22) * 1.5);
      const rx = el.x - radius;
      const ry = el.y - radius;
      const rw = w + radius * 2;
      const rh = h + radius * 2;
      return pt.x >= rx && pt.x <= rx + rw && pt.y >= ry && pt.y <= ry + rh;
    } else if (el.type === 'stamp') {
      const s = el.size || 40;
      const rx = el.x - radius;
      const ry = el.y - radius;
      const rw = s + radius * 2;
      const rh = s + radius * 2;
      return pt.x >= rx && pt.x <= rx + rw && pt.y >= ry && pt.y <= ry + rh;
    } else if (el.type === 'stroke') {
      const strokeThreshold = Math.max(16, radius + (el.width || 4) / 2);
      const thresholdSq = strokeThreshold * strokeThreshold;
      if (!el.points || el.points.length === 0) return false;
      if (el.points.length === 1) {
        const p = el.points[0];
        return (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2 <= thresholdSq;
      }
      for (let j = 0; j < el.points.length - 1; j++) {
        const p1 = el.points[j];
        const p2 = el.points[j + 1];
        if (distToSegmentSquared(pt.x, pt.y, p1.x, p1.y, p2.x, p2.y) <= thresholdSq) {
          return true;
        }
      }
      for (const p of el.points) {
        if ((p.x - pt.x) ** 2 + (p.y - pt.y) ** 2 <= thresholdSq) {
          return true;
        }
      }
    } else if (el.type === 'connector') {
      const connThreshold = Math.max(16, radius + (el.strokeWidth || 2) * 2);
      const thresholdSq = connThreshold * connThreshold;
      return distToSegmentSquared(pt.x, pt.y, el.fromPoint.x, el.fromPoint.y, el.toPoint.x, el.toPoint.y) <= thresholdSq;
    }
    return false;
  };

  // Hit test for selecting elements with segment precision
  const hitTest = useCallback(
    (pt: Point): CanvasElement | null => {
      const list = elementsRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        if (testElementIntersect(list[i], pt, 8)) {
          return list[i];
        }
      }
      return null;
    },
    []
  );

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

  // Redraw all elements and background
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

    // Render committed elements (using live ref for instant eraser response)
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

    // Render active shape preview
    if (shapePreviewRef.current) {
      renderShape(ctx, rc, shapePreviewRef.current);
    }

    // Render active connector preview
    if (connectorPreviewRef.current) {
      renderConnector(ctx, rc, connectorPreviewRef.current);
    }

    // Render active freehand stroke
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

    // Selection bounding box
    if (selectedElementId) {
      const selectedEl = currentElements.find((e) => e.id === selectedElementId);
      if (selectedEl) {
        ctx.save();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);

        let bx = 0,
          by = 0,
          bw = 0,
          bh = 0;
        if (selectedEl.type === 'shape' || selectedEl.type === 'model') {
          bx = selectedEl.x - 6;
          by = selectedEl.y - 6;
          bw = selectedEl.width + 12;
          bh = selectedEl.height + 12;
        } else if (selectedEl.type === 'stamp') {
          bx = selectedEl.x - 6;
          by = selectedEl.y - 6;
          bw = selectedEl.size + 12;
          bh = selectedEl.size + 12;
        } else if (selectedEl.type === 'text') {
          bx = selectedEl.x - 6;
          by = selectedEl.y - 6;
          bw = Math.max(60, selectedEl.fontSize * selectedEl.text.length * 0.65) + 12;
          bh = selectedEl.fontSize * 1.5 + 12;
        } else if (selectedEl.type === 'stroke') {
          let minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity;
          for (const p of selectedEl.points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
          }
          bx = minX - 8;
          by = minY - 8;
          bw = maxX - minX + 16;
          bh = maxY - minY + 16;
        } else if (selectedEl.type === 'connector') {
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([4 / zoom, 4 / zoom]);
          ctx.beginPath();
          ctx.moveTo(selectedEl.fromPoint.x, selectedEl.fromPoint.y);
          ctx.lineTo(selectedEl.toPoint.x, selectedEl.toPoint.y);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.arc(selectedEl.fromPoint.x, selectedEl.fromPoint.y, 5 / zoom, 0, Math.PI * 2);
          ctx.arc(selectedEl.toPoint.x, selectedEl.toPoint.y, 5 / zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return;
        }

        ctx.strokeRect(bx, by, bw, bh);

        // Resize / Corner handles
        ctx.setLineDash([]);
        ctx.fillStyle = '#2563eb';
        const hSize = 7 / zoom;
        ctx.fillRect(bx - hSize / 2, by - hSize / 2, hSize, hSize);
        ctx.fillRect(bx + bw - hSize / 2, by - hSize / 2, hSize, hSize);
        ctx.fillRect(bx - hSize / 2, by + bh - hSize / 2, hSize, hSize);
        ctx.fillRect(bx + bw - hSize / 2, by + bh - hSize / 2, hSize, hSize);

        ctx.restore();
      }
    }

    // Highlight element under eraser hover
    if (currentTool === 'eraser' && hoveredEraserIdRef.current && !isErasingRef.current) {
      const hoveredEl = currentElements.find((e) => e.id === hoveredEraserIdRef.current);
      if (hoveredEl) {
        ctx.save();
        if (hoveredEl.type === 'shape' || hoveredEl.type === 'model') {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([4 / zoom, 4 / zoom]);
          ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
          ctx.fillRect(hoveredEl.x - 4, hoveredEl.y - 4, hoveredEl.width + 8, hoveredEl.height + 8);
          ctx.strokeRect(hoveredEl.x - 4, hoveredEl.y - 4, hoveredEl.width + 8, hoveredEl.height + 8);
        } else if (hoveredEl.type === 'stamp') {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([4 / zoom, 4 / zoom]);
          ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
          ctx.fillRect(hoveredEl.x - 4, hoveredEl.y - 4, hoveredEl.size + 8, hoveredEl.size + 8);
          ctx.strokeRect(hoveredEl.x - 4, hoveredEl.y - 4, hoveredEl.size + 8, hoveredEl.size + 8);
        } else if (hoveredEl.type === 'text') {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([4 / zoom, 4 / zoom]);
          const w = Math.max(60, hoveredEl.fontSize * hoveredEl.text.length * 0.65);
          const h = hoveredEl.fontSize * 1.5;
          ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
          ctx.fillRect(hoveredEl.x - 4, hoveredEl.y - 4, w + 8, h + 8);
          ctx.strokeRect(hoveredEl.x - 4, hoveredEl.y - 4, w + 8, h + 8);
        } else if (hoveredEl.type === 'stroke') {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.55)';
          ctx.lineWidth = Math.max(6 / zoom, (hoveredEl.width || 3) + 6 / zoom);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          hoveredEl.points.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
        }
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
  }, [
    selectedElementId,
    paperTexture,
    zoom,
    pan,
    currentTool,
    currentColor,
    strokeWidth,
    isRough,
  ]);

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
  }, [elements, redraw]);

  // POINTER DOWN
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Capture pointer so all movement events stream to canvas
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // Pan with middle click, Space, or Shift+left click
    if (e.button === 1 || e.altKey || (e.button === 0 && e.shiftKey)) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (e.button !== 0) return;

    const pt = getCanvasCoords(e.clientX, e.clientY);

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
        hits.forEach((h) => {
          spawnEraserDust(pt.x, pt.y);
          if (selectedElementId === h.id) onSelectElement(null);
        });
        redraw();
      }
      return;
    }

    // Select Tool
    if (currentTool === 'select') {
      const hit = hitTest(pt);
      if (hit) {
        onSelectElement(hit.id);
        isDraggingElementRef.current = true;
        if ('x' in hit && 'y' in hit) {
          elementDragOffsetRef.current = { x: pt.x - hit.x, y: pt.y - hit.y };
        } else {
          elementDragOffsetRef.current = { x: pt.x, y: pt.y };
        }
      } else {
        onSelectElement(null);
      }
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
    // Update dynamic eraser cursor ring follower
    if (currentTool === 'eraser') {
      if (eraserCursorRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        eraserCursorRef.current.style.left = `${e.clientX - rect.left}px`;
        eraserCursorRef.current.style.top = `${e.clientY - rect.top}px`;
        eraserCursorRef.current.style.opacity = '1';
      }
    }

    // Panning
    if (isPanningRef.current) {
      onPanChange({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const pt = getCanvasCoords(e.clientX, e.clientY);

    // Continuous Drag / Scrub Erasing
    if (currentTool === 'eraser') {
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
              hits.forEach((h) => {
                spawnEraserDust(interpPt.x, interpPt.y);
                if (selectedElementId === h.id) onSelectElement(null);
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
        // Eraser hover strike-zone detection
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

    // Moving selected element
    if (isDraggingElementRef.current && selectedElementId) {
      const nextElements = elementsRef.current.map((el) => {
        if (el.id !== selectedElementId) return el;
        if (
          el.type === 'shape' ||
          el.type === 'model' ||
          el.type === 'text' ||
          el.type === 'stamp'
        ) {
          const newX = pt.x - elementDragOffsetRef.current.x;
          const newY = pt.y - elementDragOffsetRef.current.y;
          const dx = newX - el.x;
          const dy = newY - el.y;
          return {
            ...el,
            x: newX,
            y: newY,
            startPoint: el.type === 'shape' && el.startPoint ? { x: el.startPoint.x + dx, y: el.startPoint.y + dy } : undefined,
            endPoint: el.type === 'shape' && el.endPoint ? { x: el.endPoint.x + dx, y: el.endPoint.y + dy } : undefined,
          };
        } else if (el.type === 'stroke') {
          const dx = pt.x - elementDragOffsetRef.current.x;
          const dy = pt.y - elementDragOffsetRef.current.y;
          return {
            ...el,
            points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
          };
        } else if (el.type === 'connector') {
          const dx = pt.x - elementDragOffsetRef.current.x;
          const dy = pt.y - elementDragOffsetRef.current.y;
          return {
            ...el,
            fromPoint: { x: el.fromPoint.x + dx, y: el.fromPoint.y + dy },
            toPoint: { x: el.toPoint.x + dx, y: el.toPoint.y + dy },
          };
        }
        return el;
      });
      elementsRef.current = nextElements;
      redraw();
      const draggedEl = elementsRef.current.find((e) => e.id === selectedElementId);
      if (draggedEl?.type === 'stroke' || draggedEl?.type === 'connector') {
        elementDragOffsetRef.current = { x: pt.x, y: pt.y };
      }
      return;
    }

    if (!isDrawingRef.current) return;

    // Freehand Drawing: Add point and redraw immediately
    if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'smart') {
      activePointsRef.current.push(pt);
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
        x: (currentShapeType === 'arrow' || currentShapeType === 'line') ? minX : (end.x >= start.x ? start.x : end.x),
        y: (currentShapeType === 'arrow' || currentShapeType === 'line') ? minY : (end.y >= start.y ? start.y : end.y),
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

    // Eraser gesture finish
    if (isErasingRef.current) {
      isErasingRef.current = false;
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

    if (isDraggingElementRef.current) {
      isDraggingElementRef.current = false;
      onElementsChange(elementsRef.current);
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
          onSelectElement(newShape.id);
          onQuickMessage?.(`✨ Smart Assistant converted scribble into a napkin ${recognized.type}!`);
          redraw();
          return;
        }
      }

      // Standard freehand stroke (even single dot or tap)
      const newStroke: StrokeElement = {
        id: 'stroke_' + Math.random().toString(36).substring(2, 9),
        type: 'stroke',
        tool: currentTool === 'highlighter' ? 'highlighter' : 'pen',
        points,
        color: currentColor,
        width: strokeWidth,
        isRough,
      };
      onElementsChange([...elements, newStroke]);
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
        ? preview.startPoint && preview.endPoint && Math.hypot(preview.endPoint.x - preview.startPoint.x, preview.endPoint.y - preview.startPoint.y) > 6
        : preview.width > 4 && preview.height > 4;

      if (isValid) {
        const finalShape: ShapeElement = {
          ...preview,
          id: 'shape_' + Math.random().toString(36).substring(2, 9),
        };
        onElementsChange([...elements, finalShape]);
        onSelectElement(finalShape.id);
      }
      redraw();
      return;
    }

    // Connector Creation Complete
    if (currentTool === 'connector' && connectorPreviewRef.current) {
      const preview = connectorPreviewRef.current;
      connectorPreviewRef.current = null;
      dragStartRef.current = null;

      const dist = Math.hypot(
        preview.toPoint.x - preview.fromPoint.x,
        preview.toPoint.y - preview.fromPoint.y
      );
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
        onSelectElement(finalConnector.id);
        onQuickMessage?.('🔗 Added connector! Click to inspect or change label.');
      }
      redraw();
      return;
    }
  };

  // Zoom with mouse wheel (non-passive listener to allow preventDefault)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(3.0, Math.max(0.3, zoom * zoomFactor));

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newPan = {
        x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
        y: mouseY - (mouseY - pan.y) * (newZoom / zoom),
      };

      onPanChange(newPan);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, pan, onPanChange]);

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
        onSelectElement(newText.id);
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
          currentTool === 'select'
            ? 'default'
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
          {/* Center precision indicator dot */}
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
    </div>
  );
};
