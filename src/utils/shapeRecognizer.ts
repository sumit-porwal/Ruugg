import type { Point, ShapeType } from '../types';

export interface RecognizedShape {
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  startPoint?: Point;
  endPoint?: Point;
}

/**
 * Recognize rough freehand drawings as standard visual thinking shapes
 */
export function recognizeRoughShape(points: Point[]): RecognizedShape | null {
  if (points.length < 8) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const pt of points) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  const width = Math.max(20, maxX - minX);
  const height = Math.max(20, maxY - minY);
  const startPt = points[0];
  const endPt = points[points.length - 1];

  const startEndDist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);
  const perimeterApprox = points.reduce((acc, pt, i) => {
    if (i === 0) return 0;
    return acc + Math.hypot(pt.x - points[i - 1].x, pt.y - points[i - 1].y);
  }, 0);

  const isClosed = startEndDist < Math.max(40, perimeterApprox * 0.25);

  // If open stroke
  if (!isClosed) {
    // Check if it's a straight line
    const straightDist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);
    const linearity = straightDist / (perimeterApprox || 1);

    if (linearity > 0.82) {
      return {
        type: 'line',
        x: minX,
        y: minY,
        width,
        height,
        confidence: linearity,
        startPoint: { x: startPt.x, y: startPt.y },
        endPoint: { x: endPt.x, y: endPt.y },
      };
    }

    // Check if arrow: end has a back-hook or significant angle
    if (points.length >= 12 && linearity > 0.65) {
      // Find the farthest point from startPt as the arrowhead tip
      let maxDist = 0;
      let tipPt = endPt;
      for (const p of points) {
        const d = Math.hypot(p.x - startPt.x, p.y - startPt.y);
        if (d > maxDist) {
          maxDist = d;
          tipPt = p;
        }
      }

      return {
        type: 'arrow',
        x: minX,
        y: minY,
        width,
        height,
        confidence: 0.8,
        startPoint: { x: startPt.x, y: startPt.y },
        endPoint: { x: tipPt.x, y: tipPt.y },
      };
    }

    return null;
  }

  // Closed shape recognition
  // Estimate area using shoelace formula
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  area = Math.abs(area) / 2;

  // Circularity metric: 4 * PI * Area / (Perimeter^2)
  // For a perfect circle, circularity = 1.0. For square, ~0.785. For triangle, ~0.6
  const circularity = (4 * Math.PI * area) / Math.max(1, perimeterApprox * perimeterApprox);

  // Check aspect ratio
  const aspectRatio = width / height;

  if (circularity > 0.72 && aspectRatio > 0.65 && aspectRatio < 1.55) {
    return {
      type: 'circle',
      x: minX,
      y: minY,
      width: Math.max(width, height),
      height: Math.max(width, height),
      confidence: circularity,
    };
  }

  // Check if diamond: area ratio against bounding box ~ 0.5
  const boxArea = width * height;
  const fillRatio = area / (boxArea || 1);

  if (fillRatio > 0.4 && fillRatio < 0.62) {
    return {
      type: 'diamond',
      x: minX,
      y: minY,
      width,
      height,
      confidence: 0.75,
    };
  }

  // Check if triangle
  if (fillRatio > 0.35 && fillRatio < 0.65) {
    return {
      type: 'triangle',
      x: minX,
      y: minY,
      width,
      height,
      confidence: 0.7,
    };
  }

  // If fillRatio is high (> 0.65), it's likely a rectangle/box
  if (fillRatio >= 0.62) {
    return {
      type: 'rect',
      x: minX,
      y: minY,
      width,
      height,
      confidence: fillRatio,
    };
  }

  // Default fallback for closed shape
  return {
    type: 'circle',
    x: minX,
    y: minY,
    width,
    height,
    confidence: 0.6,
  };
}
