import type { CanvasElement, Point } from '../types';

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

/**
 * Distance squared from point (px, py) to line segment (vx, vy)-(wx, wy)
 */
export function distToSegmentSquared(
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

/**
 * Rotate a point around a center by an angle in radians
 */
export function rotatePoint(pt: Point, center: Point, angle: number): Point {
  if (!angle) return { x: pt.x, y: pt.y };
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = pt.x - center.x;
  const dy = pt.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

/**
 * Compute the unrotated AABB (Axis-Aligned Bounding Box) for any canvas element
 */
export function getElementBounds(el: CanvasElement): Bounds {
  if (el.type === 'shape') {
    if ((el.shapeType === 'arrow' || el.shapeType === 'line') && el.startPoint && el.endPoint) {
      const minX = Math.min(el.startPoint.x, el.endPoint.x);
      const maxX = Math.max(el.startPoint.x, el.endPoint.x);
      const minY = Math.min(el.startPoint.y, el.endPoint.y);
      const maxY = Math.max(el.startPoint.y, el.endPoint.y);
      const width = Math.max(16, maxX - minX);
      const height = Math.max(16, maxY - minY);
      return {
        minX,
        minY,
        maxX,
        maxY,
        width,
        height,
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
      };
    }
    const width = Math.max(16, el.width || 60);
    const height = Math.max(16, el.height || 60);
    return {
      minX: el.x,
      minY: el.y,
      maxX: el.x + width,
      maxY: el.y + height,
      width,
      height,
      cx: el.x + width / 2,
      cy: el.y + height / 2,
    };
  }

  if (el.type === 'model') {
    const width = Math.max(20, el.width || 60);
    const height = Math.max(20, el.height || 60);
    return {
      minX: el.x,
      minY: el.y,
      maxX: el.x + width,
      maxY: el.y + height,
      width,
      height,
      cx: el.x + width / 2,
      cy: el.y + height / 2,
    };
  }

  if (el.type === 'text') {
    const textLen = el.text ? el.text.length : 1;
    const width = Math.max(60, (el.fontSize || 22) * textLen * 0.65);
    const height = Math.max(26, (el.fontSize || 22) * 1.5);
    return {
      minX: el.x,
      minY: el.y,
      maxX: el.x + width,
      maxY: el.y + height,
      width,
      height,
      cx: el.x + width / 2,
      cy: el.y + height / 2,
    };
  }

  if (el.type === 'stamp') {
    const size = Math.max(16, el.size || 48);
    return {
      minX: el.x,
      minY: el.y,
      maxX: el.x + size,
      maxY: el.y + size,
      width: size,
      height: size,
      cx: el.x + size / 2,
      cy: el.y + size / 2,
    };
  }

  if (el.type === 'stroke') {
    if (!el.points || el.points.length === 0) {
      return { minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10, cx: 5, cy: 5 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of el.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const width = Math.max(10, maxX - minX);
    const height = Math.max(10, maxY - minY);
    return {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
    };
  }

  if (el.type === 'connector') {
    const minX = Math.min(el.fromPoint.x, el.toPoint.x);
    const maxX = Math.max(el.fromPoint.x, el.toPoint.x);
    const minY = Math.min(el.fromPoint.y, el.toPoint.y);
    const maxY = Math.max(el.fromPoint.y, el.toPoint.y);
    const width = Math.max(16, maxX - minX);
    const height = Math.max(16, maxY - minY);
    return {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
    };
  }

  return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, cx: 0, cy: 0 };
}

/**
 * Union bounding box enclosing multiple elements
 */
export function getSelectionBounds(elements: CanvasElement[]): Bounds | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    const b = getElementBounds(el);
    if (el.rotation) {
      // If rotated, compute rotated corner bounds
      const corners: Point[] = [
        { x: b.minX, y: b.minY },
        { x: b.maxX, y: b.minY },
        { x: b.maxX, y: b.maxY },
        { x: b.minX, y: b.maxY },
      ];
      for (const c of corners) {
        const rc = rotatePoint(c, { x: b.cx, y: b.cy }, el.rotation);
        if (rc.x < minX) minX = rc.x;
        if (rc.x > maxX) maxX = rc.x;
        if (rc.y < minY) minY = rc.y;
        if (rc.y > maxY) maxY = rc.y;
      }
    } else {
      if (b.minX < minX) minX = b.minX;
      if (b.maxX > maxX) maxX = b.maxX;
      if (b.minY < minY) minY = b.minY;
      if (b.maxY > maxY) maxY = b.maxY;
    }
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  };
}

/**
 * Test whether point pt intersects element el, taking element rotation into account
 */
export function testElementIntersect(el: CanvasElement, pt: Point, radius: number): boolean {
  const bounds = getElementBounds(el);
  const testPt = el.rotation
    ? rotatePoint(pt, { x: bounds.cx, y: bounds.cy }, -el.rotation)
    : pt;

  if (el.type === 'shape') {
    if ((el.shapeType === 'arrow' || el.shapeType === 'line') && el.startPoint && el.endPoint) {
      const threshold = Math.max(16, radius + (el.strokeWidth || 3) * 1.5);
      return (
        distToSegmentSquared(
          testPt.x,
          testPt.y,
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
    return testPt.x >= rx && testPt.x <= rx + rw && testPt.y >= ry && testPt.y <= ry + rh;
  }

  if (el.type === 'model') {
    const rx = el.x - radius;
    const ry = el.y - radius;
    const rw = (el.width || 60) + radius * 2;
    const rh = (el.height || 60) + radius * 2;
    return testPt.x >= rx && testPt.x <= rx + rw && testPt.y >= ry && testPt.y <= ry + rh;
  }

  if (el.type === 'text') {
    const textLen = el.text ? el.text.length : 1;
    const w = Math.max(60, (el.fontSize || 22) * textLen * 0.65);
    const h = Math.max(30, (el.fontSize || 22) * 1.5);
    const rx = el.x - radius;
    const ry = el.y - radius;
    const rw = w + radius * 2;
    const rh = h + radius * 2;
    return testPt.x >= rx && testPt.x <= rx + rw && testPt.y >= ry && testPt.y <= ry + rh;
  }

  if (el.type === 'stamp') {
    const s = el.size || 40;
    const rx = el.x - radius;
    const ry = el.y - radius;
    const rw = s + radius * 2;
    const rh = s + radius * 2;
    return testPt.x >= rx && testPt.x <= rx + rw && testPt.y >= ry && testPt.y <= ry + rh;
  }

  if (el.type === 'stroke') {
    const strokeThreshold = Math.max(16, radius + (el.width || 4) / 2);
    const thresholdSq = strokeThreshold * strokeThreshold;
    if (!el.points || el.points.length === 0) return false;
    if (el.points.length === 1) {
      const p = el.points[0];
      return (p.x - testPt.x) ** 2 + (p.y - testPt.y) ** 2 <= thresholdSq;
    }
    for (let j = 0; j < el.points.length - 1; j++) {
      const p1 = el.points[j];
      const p2 = el.points[j + 1];
      if (distToSegmentSquared(testPt.x, testPt.y, p1.x, p1.y, p2.x, p2.y) <= thresholdSq) {
        return true;
      }
    }
    for (const p of el.points) {
      if ((p.x - testPt.x) ** 2 + (p.y - testPt.y) ** 2 <= thresholdSq) {
        return true;
      }
    }
    return false;
  }

  if (el.type === 'connector') {
    const connThreshold = Math.max(16, radius + (el.strokeWidth || 2) * 2);
    const thresholdSq = connThreshold * connThreshold;
    return (
      distToSegmentSquared(
        testPt.x,
        testPt.y,
        el.fromPoint.x,
        el.fromPoint.y,
        el.toPoint.x,
        el.toPoint.y
      ) <= thresholdSq
    );
  }

  return false;
}

/**
 * Test whether element is contained within or intersects a marquee rectangle
 */
export function testElementInRect(
  el: CanvasElement,
  rect: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  const b = getElementBounds(el);
  if (el.rotation) {
    const corners: Point[] = [
      { x: b.minX, y: b.minY },
      { x: b.maxX, y: b.minY },
      { x: b.maxX, y: b.maxY },
      { x: b.minX, y: b.maxY },
    ];
    let anyIn = false;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const c of corners) {
      const rc = rotatePoint(c, { x: b.cx, y: b.cy }, el.rotation);
      if (rc.x >= rect.minX && rc.x <= rect.maxX && rc.y >= rect.minY && rc.y <= rect.maxY) {
        anyIn = true;
      }
      if (rc.x < minX) minX = rc.x;
      if (rc.x > maxX) maxX = rc.x;
      if (rc.y < minY) minY = rc.y;
      if (rc.y > maxY) maxY = rc.y;
    }
    if (anyIn) return true;
    return !(minX > rect.maxX || maxX < rect.minX || minY > rect.maxY || maxY < rect.minY);
  }
  return !(b.minX > rect.maxX || b.maxX < rect.minX || b.minY > rect.maxY || b.maxY < rect.minY);
}

/**
 * Shift an element's position by dx, dy
 */
export function offsetElement(el: CanvasElement, dx: number, dy: number): CanvasElement {
  if (el.type === 'shape') {
    return {
      ...el,
      x: el.x + dx,
      y: el.y + dy,
      startPoint: el.startPoint ? { x: el.startPoint.x + dx, y: el.startPoint.y + dy } : undefined,
      endPoint: el.endPoint ? { x: el.endPoint.x + dx, y: el.endPoint.y + dy } : undefined,
    };
  }
  if (el.type === 'model' || el.type === 'text' || el.type === 'stamp') {
    return {
      ...el,
      x: el.x + dx,
      y: el.y + dy,
    };
  }
  if (el.type === 'stroke') {
    return {
      ...el,
      points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
    };
  }
  if (el.type === 'connector') {
    return {
      ...el,
      fromPoint: { x: el.fromPoint.x + dx, y: el.fromPoint.y + dy },
      toPoint: { x: el.toPoint.x + dx, y: el.toPoint.y + dy },
    };
  }
  return el;
}

/**
 * Deep clone an element with an offset and new ID
 */
export function duplicateElement(
  el: CanvasElement,
  dx = 24,
  dy = 24,
  newGroupId?: string
): CanvasElement {
  const newId = (el.type === 'shape' ? 'shape_' : el.type === 'stroke' ? 'stroke_' : el.type + '_') +
    Math.random().toString(36).substring(2, 9);

  const moved = offsetElement(el, dx, dy);
  return {
    ...JSON.parse(JSON.stringify(moved)),
    id: newId,
    groupId: newGroupId !== undefined ? newGroupId : el.groupId,
  };
}

/**
 * Get CSS cursor for resize handle, taking rotation into account
 */
export function getResizeCursor(handle: string, rotationRad = 0): string {
  if (handle === 'rotate') return 'grab';
  if (handle === 'arrow_start' || handle === 'arrow_end' || handle === 'conn_from' || handle === 'conn_to') {
    return 'crosshair';
  }

  const handleAngles: Record<string, number> = {
    n: 0,
    ne: 45,
    e: 90,
    se: 135,
    s: 180,
    sw: 225,
    w: 270,
    nw: 315,
  };

  const baseAngle = handleAngles[handle] ?? 0;
  const rotDeg = ((rotationRad * 180) / Math.PI) % 360;
  const totalAngle = (baseAngle + rotDeg + 360) % 360;

  if ((totalAngle >= 337.5 && totalAngle <= 360) || (totalAngle >= 0 && totalAngle < 22.5) || (totalAngle >= 157.5 && totalAngle < 202.5)) {
    return 'ns-resize';
  }
  if ((totalAngle >= 22.5 && totalAngle < 67.5) || (totalAngle >= 202.5 && totalAngle < 247.5)) {
    return 'nesw-resize';
  }
  if ((totalAngle >= 67.5 && totalAngle < 112.5) || (totalAngle >= 247.5 && totalAngle < 292.5)) {
    return 'ew-resize';
  }
  return 'nwse-resize';
}
