import type { Point, StylusSettings } from '../types';

export const DEFAULT_STYLUS_SETTINGS: StylusSettings = {
  enabled: true,
  pressureEnabled: true,
  pressureCurve: 'normal',
  streamline: 0.35,
  palmRejection: true,
  fingerAction: 'pan',
  hardwareEraserEnabled: true,
  barrelButtonAction: 'eraser',
};

const STYLUS_STORAGE_KEY = 'ruugg_stylus_settings';

/**
 * Load stylus settings from browser localStorage
 */
export function loadStylusSettings(): StylusSettings {
  try {
    const raw = localStorage.getItem(STYLUS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STYLUS_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STYLUS_SETTINGS,
      ...parsed,
    };
  } catch (e) {
    console.warn('Failed to load stylus settings from localStorage, using defaults:', e);
    return { ...DEFAULT_STYLUS_SETTINGS };
  }
}

/**
 * Persist stylus settings to browser localStorage
 */
export function saveStylusSettings(settings: StylusSettings): void {
  try {
    localStorage.setItem(STYLUS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save stylus settings to localStorage:', e);
  }
}

/**
 * Apply non-linear response curve to raw pointer pressure (0.0 to 1.0)
 * - 'soft': more responsive with gentle touch; reaches rich line thickness early
 * - 'normal': direct 1:1 natural response
 * - 'firm': requires firmer pressure for full stroke width (prevents heavy lines when writing fast)
 */
export function applyPressureCurve(pressure: number, curve: 'soft' | 'normal' | 'firm'): number {
  const clamped = Math.max(0.01, Math.min(1.0, pressure));
  if (curve === 'soft') {
    return Math.pow(clamped, 0.65);
  }
  if (curve === 'firm') {
    return Math.pow(clamped, 1.55);
  }
  return clamped;
}

/**
 * Real-time point streamline filter (exponential moving average)
 * Eliminates digitizer jitter, stair-stepping, and trembling on glass tablet screens
 */
export function applyStreamlineToPoint(
  newPt: Point,
  prevPt: Point | null,
  streamline: number
): Point {
  if (!prevPt || streamline <= 0.05) {
    return { ...newPt };
  }

  // Weight for current point vs previous point:
  // streamline = 0.35 -> alpha = 0.65 (responsive, eliminates glass micro-jitter)
  // streamline = 0.65 -> alpha = 0.35 (flowing calligraphy, highly smoothed)
  const factor = Math.max(0.15, Math.min(0.9, 1 - streamline));

  const smoothedX = prevPt.x + (newPt.x - prevPt.x) * factor;
  const smoothedY = prevPt.y + (newPt.y - prevPt.y) * factor;

  let smoothedPressure = newPt.pressure;
  if (newPt.pressure !== undefined && prevPt.pressure !== undefined) {
    smoothedPressure = prevPt.pressure + (newPt.pressure - prevPt.pressure) * factor;
  }

  return {
    ...newPt,
    x: smoothedX,
    y: smoothedY,
    pressure: smoothedPressure,
  };
}

/**
 * Post-stroke smoothing to ensure smooth spline continuity
 */
export function smoothPointSequence(points: Point[], streamline: number): Point[] {
  if (points.length <= 2 || streamline <= 0.05) return points;

  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    result.push(applyStreamlineToPoint(points[i], result[i - 1], streamline));
  }
  return result;
}

/**
 * Detect if pointer event originated from physical stylus eraser tip
 * (e.g. Surface Pen eraser, Wacom inverted pen, EMR eraser tail, or pen button 5)
 */
export function isEraserPointer(e: React.PointerEvent | PointerEvent): boolean {
  // Standard W3C Pointer Events: buttons bitmask 32 represents eraser
  const buttons = e.buttons !== undefined ? e.buttons : 0;
  const button = e.button !== undefined ? e.button : -1;
  const pointerType = (e as any).pointerType;

  if ((buttons & 32) !== 0 || button === 5) {
    return true;
  }

  // Some digital pens report pointerType === 'pen' with secondary eraser button
  if (pointerType === 'pen' && (buttons === 32 || button === 5)) {
    return true;
  }

  return false;
}

/**
 * Detect if stylus barrel / side button is pressed (secondary button)
 */
export function isBarrelButton(e: React.PointerEvent | PointerEvent): boolean {
  const buttons = e.buttons !== undefined ? e.buttons : 0;
  const button = e.button !== undefined ? e.button : -1;
  return (buttons & 2) !== 0 || button === 2;
}

/**
 * Detect if touch event corresponds to a resting palm on capacitive tablet screen
 * Based on contact area dimensions (width & height reported by touch digitizer)
 */
export function isPalmContact(e: React.PointerEvent | PointerEvent): boolean {
  if (e.pointerType !== 'touch') return false;

  // Typical finger touch is 10-20px wide; palm contact is substantially larger (> 26px)
  const w = e.width || 0;
  const h = e.height || 0;
  if (w > 26 || h > 26) {
    return true;
  }

  // Some browsers report radiusX/radiusY
  const radiusX = (e as any).radiusX || 0;
  const radiusY = (e as any).radiusY || 0;
  if (radiusX > 15 || radiusY > 15) {
    return true;
  }

  return false;
}
