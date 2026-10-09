import type {
  ConnectorElement,
  ModelElement,
  PaperTexture,
  SemanticMeta,
  ShapeElement,
  StrokeElement,
  TextElement,
  StampElement,
} from '../types';
import { SEMANTIC_TAGS_MAP } from './semanticTags';

/**
 * Render canvas background texture
 */
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  texture: PaperTexture
) {
  ctx.save();

  if (texture === 'blueprint') {
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, width, height);

    // Grid lines for blueprint
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    const step = 28;
    ctx.beginPath();
    for (let x = 0; x < width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Major grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < width; x += step * 4) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += step * 4) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  } else if (texture === 'kraft') {
    // Warm cafe kraft paper
    ctx.fillStyle = '#eddcc4';
    ctx.fillRect(0, 0, width, height);

    // Kraft paper fiber flecks
    ctx.fillStyle = 'rgba(140, 95, 55, 0.12)';
    const dotStep = 24;
    for (let x = dotStep / 2; x < width; x += dotStep) {
      for (let y = dotStep / 2; y < height; y += dotStep) {
        ctx.fillRect(x + ((y % 48 === 0) ? 8 : 0), y, 2, 1.5);
      }
    }

    // Outer cafe kraft embossed border
    ctx.strokeStyle = 'rgba(150, 105, 65, 0.25)';
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    ctx.fillStyle = 'rgba(140, 95, 55, 0.35)';
    ctx.font = "italic 13px 'Patrick Hand', cursive";
    ctx.textAlign = 'right';
    ctx.fillText('☕ Café Kraft Napkin', width - 30, height - 26);
  } else if (texture === 'grid') {
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, width, height);

    // Fine grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1;
    const step = 20;
    ctx.beginPath();
    for (let x = 0; x < width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Major grid
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < width; x += step * 5) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += step * 5) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  } else if (texture === 'clean') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else {
    // 'napkin' - Authentic Dan Roam Back of the Napkin
    // Warm, organic cafe parchment gradient with authentic paper tone
    const napkinGrad = ctx.createLinearGradient(0, 0, width, height);
    napkinGrad.addColorStop(0, '#fcf8ee');
    napkinGrad.addColorStop(0.35, '#f7f0df');
    napkinGrad.addColorStop(0.7, '#f4ebd7');
    napkinGrad.addColorStop(1, '#eee2cb');
    ctx.fillStyle = napkinGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle radial table vignette (soft natural lighting)
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.max(width, height) * 0.75
    );
    vignette.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    vignette.addColorStop(0.65, 'rgba(215, 195, 165, 0.08)');
    vignette.addColorStop(1, 'rgba(175, 145, 110, 0.22)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Tactile cloth & paper fiber cross-weave pattern
    ctx.fillStyle = 'rgba(145, 115, 80, 0.055)';
    const weaveStep = 14;
    for (let y = 10; y < height - 10; y += weaveStep) {
      ctx.fillRect(10, y, width - 20, 0.8);
    }
    for (let x = 10; x < width - 10; x += weaveStep) {
      ctx.fillRect(x, 10, 0.8, height - 20);
    }

    // Organic natural paper pulp grain flecks
    ctx.fillStyle = 'rgba(135, 105, 70, 0.09)';
    for (let x = 20; x < width - 20; x += 32) {
      for (let y = 20; y < height - 20; y += 32) {
        const ox = ((x * 19 + y * 29) % 23) - 11;
        const oy = ((x * 23 + y * 13) % 23) - 11;
        ctx.fillRect(x + ox, y + oy, 2, 1.4);
      }
    }

    // Embossed crimped napkin borders (characteristic waffle/scallop pattern on dinner napkins)
    const crimp1 = 18;
    const crimp2 = 28;
    const dotSpacing = 12;
    ctx.fillStyle = 'rgba(150, 120, 85, 0.28)';
    for (let x = crimp1; x < width - crimp1; x += dotSpacing) {
      ctx.fillRect(x, crimp1, 2.5, 2.5);
      ctx.fillRect(x + 6, crimp2, 2.5, 2.5);
      ctx.fillRect(x, height - crimp1 - 2.5, 2.5, 2.5);
      ctx.fillRect(x + 6, height - crimp2 - 2.5, 2.5, 2.5);
    }
    for (let y = crimp1; y < height - crimp1; y += dotSpacing) {
      ctx.fillRect(crimp1, y, 2.5, 2.5);
      ctx.fillRect(crimp2, y + 6, 2.5, 2.5);
      ctx.fillRect(width - crimp1 - 2.5, y, 2.5, 2.5);
      ctx.fillRect(width - crimp2 - 2.5, y + 6, 2.5, 2.5);
    }

    // Outer embossed pressed edge grooves
    ctx.strokeStyle = 'rgba(155, 125, 90, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, width - 28, height - 28);

    // Inner embossed stitch line with light bevel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    ctx.strokeStyle = 'rgba(150, 120, 85, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(34, 34, width - 68, height - 68);
    ctx.setLineDash([]);

    // Realistic folded paper creases (center vertical & horizontal quarter-folds)
    const midX = width / 2;
    const midY = height / 2;

    // Vertical quarter-fold crease
    ctx.strokeStyle = 'rgba(130, 100, 65, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, 14);
    ctx.lineTo(midX, height - 14);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX + 2, 14);
    ctx.lineTo(midX + 2, height - 14);
    ctx.stroke();

    // Horizontal quarter-fold crease
    ctx.strokeStyle = 'rgba(130, 100, 65, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, midY);
    ctx.lineTo(width - 14, midY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(14, midY + 2);
    ctx.lineTo(width - 14, midY + 2);
    ctx.stroke();

    // Faint authentic cafe coffee ring watermark in top right
    const coffeeX = width - 120;
    const coffeeY = 110;
    const coffeeR = 46;
    ctx.strokeStyle = 'rgba(145, 95, 45, 0.08)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(coffeeX, coffeeY, coffeeR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(135, 80, 30, 0.05)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(coffeeX + 2, coffeeY + 1, coffeeR - 3, 0.5, Math.PI * 1.8);
    ctx.stroke();

    // Napkin watermark in bottom right
    ctx.fillStyle = 'rgba(140, 110, 80, 0.5)';
    ctx.font = "italic 14px 'Patrick Hand', cursive";
    ctx.textAlign = 'right';
    ctx.fillText('☕ The Back of the Napkin • Dan Roam Academy', width - 42, height - 38);
  }

  ctx.restore();
}

/**
 * Render freehand strokes (felt pen & highlighter)
 */
export function renderStroke(ctx: CanvasRenderingContext2D, stroke: StrokeElement) {
  if (stroke.points.length === 0) return;

  ctx.save();
  if (stroke.tool === 'highlighter') {
    ctx.globalAlpha = 0.38;
    ctx.globalCompositeOperation = 'multiply';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = Math.max(16, stroke.width * 4);
    ctx.lineCap = 'square';
    ctx.lineJoin = 'bevel';
  } else {
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  ctx.beginPath();
  const pts = stroke.points;
  if (pts.length === 1) {
    ctx.arc(pts[0].x, pts[0].y, stroke.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
  } else {
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      // Smooth spline interpolation
      const xc = (pts[i - 1].x + pts[i].x) / 2;
      const yc = (pts[i - 1].y + pts[i].y) / 2;
      ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Intelligent text wrapping utility for canvas rendering
 * Splits raw text by explicit newlines, then wraps each paragraph into lines fitting maxWidth
 */
export function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  rawText: string,
  maxWidth: number
): string[] {
  if (!rawText) return [];
  const paragraphs = rawText.split('\n');
  const allLines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      allLines.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let curLine = '';

    for (const w of words) {
      const testLine = curLine ? `${curLine} ${w}` : w;
      if (ctx.measureText(testLine).width <= maxWidth) {
        curLine = testLine;
      } else {
        if (curLine) allLines.push(curLine);
        curLine = w;
      }
    }
    if (curLine) allLines.push(curLine);
  }

  return allLines;
}

/**
 * Render semantic tag badge on top of an element (Fact, Assumption, Hypothesis, etc.)
 */
export function renderSemanticBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  meta?: SemanticMeta
) {
  if (!meta || !meta.tag) return;
  const tagInfo = SEMANTIC_TAGS_MAP[meta.tag];
  if (!tagInfo) return;

  ctx.save();
  const label = tagInfo.shortLabel;
  ctx.font = "bold 9px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const metrics = ctx.measureText(label);
  const pillW = metrics.width + 16;
  const pillH = 15;
  const badgeX = Math.max(4, x);
  const badgeY = Math.max(4, y - pillH / 2);

  // Background rounded pill
  ctx.fillStyle = tagInfo.bgColor;
  ctx.strokeStyle = tagInfo.borderColor;
  ctx.lineWidth = 1;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(badgeX, badgeY, pillW, pillH, 4);
  } else {
    ctx.rect(badgeX, badgeY, pillW, pillH);
  }
  ctx.fill();
  ctx.stroke();

  // Dot indicator
  ctx.fillStyle = tagInfo.color;
  ctx.beginPath();
  ctx.arc(badgeX + 6, badgeY + pillH / 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Text
  ctx.fillStyle = tagInfo.color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, badgeX + 11, badgeY + pillH / 2 + 0.5);

  // If evidence note exists, small indicator
  if (meta.evidenceNotes) {
    ctx.fillStyle = '#ef4444';
    ctx.font = "bold 10px sans-serif";
    ctx.fillText('•', badgeX + pillW - 3, badgeY + 4);
  }

  ctx.restore();
}

/**
 * Render dynamic connectors between elements
 */
export function renderConnector(
  ctx: CanvasRenderingContext2D,
  rc: any,
  conn: ConnectorElement
) {
  ctx.save();
  const { fromPoint, toPoint, color, strokeWidth, label, arrowEnd, lineStyle, isRough } = conn;
  const roughOpts = {
    roughness: isRough ? 1.2 : 0,
    stroke: color || '#475569',
    strokeWidth: strokeWidth || 2,
  };

  const dx = toPoint.x - fromPoint.x;
  const dy = toPoint.y - fromPoint.y;
  const dist = Math.hypot(dx, dy);

  if (lineStyle === 'dashed') {
    ctx.strokeStyle = color || '#475569';
    ctx.lineWidth = strokeWidth || 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(toPoint.x, toPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (lineStyle === 'curved' && dist > 40) {
    const midX = (fromPoint.x + toPoint.x) / 2;
    const midY = (fromPoint.y + toPoint.y) / 2;
    const perpX = -dy * 0.12;
    const perpY = dx * 0.12;
    const ctrlX = midX + perpX;
    const ctrlY = midY + perpY;

    if (rc && isRough) {
      rc.curve([[fromPoint.x, fromPoint.y], [ctrlX, ctrlY], [toPoint.x, toPoint.y]], roughOpts);
    } else {
      ctx.strokeStyle = color || '#475569';
      ctx.lineWidth = strokeWidth || 2;
      ctx.beginPath();
      ctx.moveTo(fromPoint.x, fromPoint.y);
      ctx.quadraticCurveTo(ctrlX, ctrlY, toPoint.x, toPoint.y);
      ctx.stroke();
    }
  } else {
    rc.line(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y, roughOpts);
  }

  // Draw arrow head at toPoint
  if (arrowEnd) {
    const angle = Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x);
    const headLen = Math.min(18, Math.max(10, dist * 0.25));
    const p1: [number, number] = [
      toPoint.x - headLen * Math.cos(angle - Math.PI / 6),
      toPoint.y - headLen * Math.sin(angle - Math.PI / 6),
    ];
    const p2: [number, number] = [
      toPoint.x - headLen * Math.cos(angle + Math.PI / 6),
      toPoint.y - headLen * Math.sin(angle + Math.PI / 6),
    ];
    rc.line(toPoint.x, toPoint.y, p1[0], p1[1], roughOpts);
    rc.line(toPoint.x, toPoint.y, p2[0], p2[1], roughOpts);
  }

  // Draw connector label pill
  if (label) {
    const midX = (fromPoint.x + toPoint.x) / 2;
    const midY = (fromPoint.y + toPoint.y) / 2;
    ctx.font = "bold 12px 'Patrick Hand', cursive";
    const textW = ctx.measureText(label).width;
    const pillW = textW + 14;
    const pillH = 20;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color || '#94a3b8';
    ctx.lineWidth = 1;
    ctx.fillRect(midX - pillW / 2, midY - pillH / 2, pillW, pillH);
    ctx.strokeRect(midX - pillW / 2, midY - pillH / 2, pillW, pillH);

    ctx.fillStyle = color || '#334155';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, midX, midY + 1);
  }

  // Render badge if connector has semantic tag
  if (conn.tag) {
    const midX = (fromPoint.x + toPoint.x) / 2;
    const midY = (fromPoint.y + toPoint.y) / 2;
    renderSemanticBadge(ctx, midX - 20, midY - 14, conn);
  }

  ctx.restore();
}

/**
 * Render standard shapes (with RoughJS napkin sketch or clean vector)
 */
export function renderShape(
  ctx: CanvasRenderingContext2D,
  rc: any,
  shape: ShapeElement
) {
  ctx.save();

  const { x, y, width, height, color, fillColor, strokeWidth, isRough, shapeType, text, fontSize } = shape;
  const roughOpts = {
    roughness: isRough ? 1.6 : 0,
    bowing: isRough ? 1.4 : 0,
    stroke: color,
    strokeWidth: strokeWidth || 2.5,
    fill: fillColor && fillColor !== 'transparent' ? fillColor : undefined,
    fillStyle: fillColor && fillColor !== 'transparent' ? 'hachure' : undefined,
    hachureGap: 6,
    hachureAngle: -45,
  };

  switch (shapeType) {
    case 'rect':
      rc.rectangle(x, y, width, height, roughOpts);
      break;

    case 'circle': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const diam = Math.min(width, height);
      rc.circle(cx, cy, diam, roughOpts);
      break;
    }

    case 'diamond': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const pts: [number, number][] = [
        [cx, y],
        [x + width, cy],
        [cx, y + height],
        [x, cy],
      ];
      rc.polygon(pts, roughOpts);
      break;
    }

    case 'triangle': {
      const pts: [number, number][] = [
        [x + width / 2, y],
        [x + width, y + height],
        [x, y + height],
      ];
      rc.polygon(pts, roughOpts);
      break;
    }

    case 'line': {
      const x1 = shape.startPoint ? shape.startPoint.x : x;
      const y1 = shape.startPoint ? shape.startPoint.y : y;
      const x2 = shape.endPoint ? shape.endPoint.x : x + width;
      const y2 = shape.endPoint ? shape.endPoint.y : y + height;
      rc.line(x1, y1, x2, y2, roughOpts);
      break;
    }

    case 'arrow': {
      const x1 = shape.startPoint ? shape.startPoint.x : x;
      const y1 = shape.startPoint ? shape.startPoint.y : y;
      const x2 = shape.endPoint ? shape.endPoint.x : x + width;
      const y2 = shape.endPoint ? shape.endPoint.y : y + height;
      rc.line(x1, y1, x2, y2, roughOpts);

      // Arrow head pointing towards (x2, y2)
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const headLen = Math.min(24, Math.max(10, dist * 0.28));
      const p1: [number, number] = [
        x2 - headLen * Math.cos(angle - Math.PI / 6),
        y2 - headLen * Math.sin(angle - Math.PI / 6),
      ];
      const p2: [number, number] = [
        x2 - headLen * Math.cos(angle + Math.PI / 6),
        y2 - headLen * Math.sin(angle + Math.PI / 6),
      ];
      rc.line(x2, y2, p1[0], p1[1], roughOpts);
      rc.line(x2, y2, p2[0], p2[1], roughOpts);
      break;
    }

    case 'bubble': {
      // Speech bubble
      const tailH = Math.min(24, height * 0.25);
      const bodyH = height - tailH;
      rc.rectangle(x, y, width, bodyH, roughOpts);
      // Small speech tail
      rc.polygon(
        [
          [x + 20, y + bodyH],
          [x + 10, y + height],
          [x + 36, y + bodyH],
        ],
        { ...roughOpts, fill: fillColor || '#ffffff', fillStyle: 'solid' }
      );
      break;
    }

    case 'star': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const outerR = Math.min(width, height) / 2;
      const innerR = outerR * 0.45;
      const pts: [number, number][] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      rc.polygon(pts, roughOpts);
      break;
    }

    case 'stickman': {
      const cx = x + width / 2;
      const headR = Math.min(width, height) * 0.2;
      const headCenterY = y + headR + 2;
      rc.circle(cx, headCenterY, headR * 2, roughOpts);

      const bodyTop = headCenterY + headR;
      const bodyBottom = y + height * 0.65;
      rc.line(cx, bodyTop, cx, bodyBottom, roughOpts);

      // Arms
      const armY = bodyTop + (bodyBottom - bodyTop) * 0.35;
      rc.line(x + width * 0.15, armY - 6, cx, armY, roughOpts);
      rc.line(cx, armY, x + width * 0.85, armY - 6, roughOpts);

      // Legs
      rc.line(cx, bodyBottom, x + width * 0.2, y + height, roughOpts);
      rc.line(cx, bodyBottom, x + width * 0.8, y + height, roughOpts);
      break;
    }
  }

  // Draw optional text inside shape with auto-wrapping, scaling, and centering
  if (text) {
    ctx.save();
    ctx.fillStyle = color;

    // Effective usable area inside shape
    const isDiamondOrCircle = shapeType === 'diamond' || shapeType === 'circle';
    const innerPaddingX = isDiamondOrCircle ? width * 0.22 : 14;
    const innerPaddingY = isDiamondOrCircle ? height * 0.22 : 12;
    const maxTextWidth = Math.max(40, width - innerPaddingX * 2);
    const maxTextHeight = Math.max(26, height - innerPaddingY * 2);

    let effectiveSize = fontSize || 16;
    let lines: string[] = [];
    let lineHeight = effectiveSize * 1.25;

    // Scale font down if lines exceed box height
    while (effectiveSize >= 11) {
      ctx.font = `600 ${effectiveSize}px 'Kalam', 'Patrick Hand', sans-serif`;
      lines = wrapCanvasText(ctx, text, maxTextWidth);
      lineHeight = effectiveSize * 1.25;
      const totalTextH = lines.length * lineHeight;
      if (totalTextH <= maxTextHeight || effectiveSize <= 11) {
        break;
      }
      effectiveSize -= 1;
    }

    ctx.font = `600 ${effectiveSize}px 'Kalam', 'Patrick Hand', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const totalHeight = lines.length * lineHeight;
    const startY = y + (height - totalHeight) / 2 + lineHeight / 2;
    const centerX = x + width / 2;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], centerX, startY + i * lineHeight);
    }
    ctx.restore();
  }

  // Render optional semantic tag badge
  if (shape.tag) {
    renderSemanticBadge(ctx, x + 6, y - 6, shape);
  }

  ctx.restore();
}

/**
 * Render standalone text element
 */
export function renderText(ctx: CanvasRenderingContext2D, el: TextElement) {
  ctx.save();
  ctx.fillStyle = el.color;
  ctx.font = `600 ${el.fontSize}px '${el.fontFamily}', cursive, sans-serif`;
  ctx.textBaseline = 'top';

  const lines = el.text.split('\n');
  const lineHeight = el.fontSize * 1.35;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], el.x, el.y + i * lineHeight);
  }

  // Render optional semantic tag badge
  if (el.tag) {
    renderSemanticBadge(ctx, el.x, el.y - 12, el);
  }

  ctx.restore();
}

/**
 * Render 6-Slices visual thinking models
 */
export function renderModel(
  ctx: CanvasRenderingContext2D,
  rc: any,
  model: ModelElement
) {
  ctx.save();
  const { x, y, width, height, modelKind, data, color, fillColor } = model;
  const roughOpts = {
    roughness: 1.5,
    bowing: 1.2,
    stroke: color,
    strokeWidth: 2.2,
    fill: fillColor || '#ffffff',
  };

  switch (modelKind) {
    case 'stickyNote': {
      // Determine distinct pastel note color & slice badge
      let noteColor = data.color || '#fef08a';
      let tagText = data.tag || 'STICKY';
      let pinColor = data.pinColor || '#ef4444';
      let tagBg = 'rgba(0, 0, 0, 0.07)';
      let tagTextColor = '#334155';

      const upperTxt = (data.text || '').toUpperCase();
      if (upperTxt.includes('1. WHO') || upperTxt.includes('WHO & WHAT')) {
        noteColor = data.color && data.color !== '#fef08a' ? data.color : '#e0e7ff';
        tagText = '1. WHO & WHAT';
        pinColor = data.pinColor || '#4f46e5';
        tagBg = 'rgba(79, 70, 229, 0.14)';
        tagTextColor = '#3730a3';
      } else if (upperTxt.includes('2. HOW MUCH') || upperTxt.includes('HOW MUCH')) {
        noteColor = data.color && data.color !== '#fef08a' ? data.color : '#d1fae5';
        tagText = '2. HOW MUCH';
        pinColor = data.pinColor || '#059669';
        tagBg = 'rgba(5, 150, 105, 0.14)';
        tagTextColor = '#065f46';
      } else if (upperTxt.includes('3. WHERE') || upperTxt.includes('WHERE')) {
        noteColor = data.color && data.color !== '#fef08a' ? data.color : '#e0f2fe';
        tagText = '3. WHERE';
        pinColor = data.pinColor || '#0284c7';
        tagBg = 'rgba(2, 132, 199, 0.14)';
        tagTextColor = '#0369a1';
      } else if (upperTxt.includes('4. WHEN') || upperTxt.includes('WHEN')) {
        noteColor = data.color && data.color !== '#fef08a' ? data.color : '#fef3c7';
        tagText = '4. WHEN';
        pinColor = data.pinColor || '#d97706';
        tagBg = 'rgba(217, 119, 6, 0.14)';
        tagTextColor = '#92400e';
      } else if (upperTxt.includes('5. HOW') || upperTxt.includes('FLOWCHARTS & STEPS') || upperTxt.includes('HOW:')) {
        noteColor = data.color && data.color !== '#fef08a' ? data.color : '#cffafe';
        tagText = '5. HOW (STEPS)';
        pinColor = data.pinColor || '#0891b2';
        tagBg = 'rgba(8, 145, 178, 0.14)';
        tagTextColor = '#155e75';
      } else if (upperTxt.includes('6. WHY') || upperTxt.includes('TRADE-OFFS & VISION') || upperTxt.includes('WHY:')) {
        noteColor = data.color && data.color !== '#fef08a' ? data.color : '#ffe4e6';
        tagText = '6. WHY';
        pinColor = data.pinColor || '#e11d48';
        tagBg = 'rgba(225, 29, 72, 0.14)';
        tagTextColor = '#9f1239';
      }

      // Soft paper drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(x + 4, y + 4, width, height);

      // Sticky note body with gentle hand-drawn rough outline
      rc.rectangle(x, y, width, height, {
        roughness: 1.3,
        bowing: 1.2,
        stroke: 'rgba(0, 0, 0, 0.12)',
        strokeWidth: 1.5,
        fill: noteColor,
        fillStyle: 'solid',
      });

      // Bottom folded curl corner
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
      ctx.beginPath();
      ctx.moveTo(x + width - 16, y + height);
      ctx.lineTo(x + width, y + height - 16);
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      ctx.fill();

      // Top pushpin with highlight and shadow
      rc.circle(x + width / 2, y + 10, 11, {
        fill: pinColor,
        fillStyle: 'solid',
        stroke: 'rgba(0, 0, 0, 0.3)',
        strokeWidth: 1.2,
      });
      // Specular pin highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(x + width / 2 - 2, y + 8, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Tag Pill Badge
      ctx.fillStyle = tagBg;
      ctx.beginPath();
      const badgeW = Math.min(130, width - 36);
      const badgeH = 20;
      if (ctx.roundRect) {
        ctx.roundRect(x + 16, y + 26, badgeW, badgeH, 6);
      } else {
        ctx.rect(x + 16, y + 26, badgeW, badgeH);
      }
      ctx.fill();

      ctx.fillStyle = tagTextColor;
      ctx.font = "bold 12px 'Outfit', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(tagText, x + 16 + badgeW / 2, y + 40);

      // Memo Content text with multi-line paragraph wrapping, auto-scaling, and bottom boundary protection
      ctx.fillStyle = '#0f172a';
      const maxNoteWidth = width - 32;
      const maxNoteHeight = height - 72;

      let noteFontSize = 16;
      let noteLines: string[] = [];
      let noteLineH = noteFontSize * 1.35;

      while (noteFontSize >= 11) {
        ctx.font = `${noteFontSize}px 'Kalam', 'Patrick Hand', cursive`;
        noteLines = wrapCanvasText(ctx, data.text || '', maxNoteWidth);
        noteLineH = noteFontSize * 1.35;
        if (noteLines.length * noteLineH <= maxNoteHeight || noteFontSize <= 11) {
          break;
        }
        noteFontSize -= 1;
      }

      ctx.font = `${noteFontSize}px 'Kalam', 'Patrick Hand', cursive`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      let curY = y + 56;
      const maxY = y + height - 16;

      for (let i = 0; i < noteLines.length; i++) {
        if (curY + noteLineH > maxY) {
          // If content exceeds sticky height, render neat ellipsis and stop
          ctx.fillText('...', x + 16, curY);
          break;
        }
        ctx.fillText(noteLines[i], x + 16, curY);
        curY += noteLineH;
      }
      break;
    }

    case 'matrix2x2': {
      // 2x2 Strategic Matrix
      // Background outline box
      rc.rectangle(x, y, width, height, {
        ...roughOpts,
        fill: '#ffffff',
        fillStyle: 'solid',
        stroke: '#94a3b8',
        strokeWidth: 1.8,
      });

      const midX = x + width / 2;
      const midY = y + height / 2;

      // X-axis line & Y-axis line
      rc.line(x + 10, midY, x + width - 10, midY, { stroke: color, strokeWidth: 2.5, roughness: 1.2 });
      rc.line(midX, y + 10, midX, y + height - 10, { stroke: color, strokeWidth: 2.5, roughness: 1.2 });

      // Quadrant labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Q1: Top-Left (High Impact, Low Effort -> QUICK WINS)
      ctx.fillStyle = '#16a34a'; // Green
      ctx.font = "bold 18px 'Outfit', sans-serif";
      ctx.fillText(data.q1?.title || 'QUICK WINS', x + width * 0.25, y + 16);
      ctx.fillStyle = '#475569';
      ctx.font = "14px 'Patrick Hand', cursive";
      ctx.fillText(data.q1?.desc || 'High Impact, Low Effort', x + width * 0.25, y + 42);

      // Q2: Top-Right (High Impact, High Effort -> STRATEGIC BETS)
      ctx.fillStyle = '#2563eb'; // Blue
      ctx.font = "bold 18px 'Outfit', sans-serif";
      ctx.fillText(data.q2?.title || 'STRATEGIC BETS', x + width * 0.75, y + 16);
      ctx.fillStyle = '#475569';
      ctx.font = "14px 'Patrick Hand', cursive";
      ctx.fillText(data.q2?.desc || 'Plan & Resource Well', x + width * 0.75, y + 42);

      // Q3: Bottom-Left (Low Impact, Low Effort -> FILL-INS)
      ctx.fillStyle = '#d97706'; // Amber
      ctx.font = "bold 18px 'Outfit', sans-serif";
      ctx.fillText(data.q3?.title || 'FILL-INS', x + width * 0.25, midY + 16);
      ctx.fillStyle = '#475569';
      ctx.font = "14px 'Patrick Hand', cursive";
      ctx.fillText(data.q3?.desc || 'Low Impact, Low Effort', x + width * 0.25, midY + 42);

      // Q4: Bottom-Right (Low Impact, High Effort -> TIME SINKS)
      ctx.fillStyle = '#dc2626'; // Red
      ctx.font = "bold 18px 'Outfit', sans-serif";
      ctx.fillText(data.q4?.title || 'TIME SINKS', x + width * 0.75, midY + 16);
      ctx.fillStyle = '#475569';
      ctx.font = "14px 'Patrick Hand', cursive";
      ctx.fillText(data.q4?.desc || 'Deprioritize / Avoid', x + width * 0.75, midY + 42);

      // Axis Titles
      ctx.fillStyle = '#0f172a';
      ctx.font = "bold 13px 'Outfit', sans-serif";
      ctx.fillText(data.xAxis || 'EFFORT / COST →', x + width / 2, y + height - 20);

      ctx.save();
      ctx.translate(x + 16, y + height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(data.yAxis || 'VALUE / IMPACT →', 0, 0);
      ctx.restore();
      break;
    }

    case 'barchart': {
      // Native Hand-drawn Bar Chart
      // Draw background card
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      // Axes
      const originX = x + 60;
      const originY = y + height - 55;
      const chartW = width - 90;
      const chartH = height - 95;

      rc.line(originX, y + 25, originX, originY, { stroke: color, strokeWidth: 2.5, roughness: 1.2 });
      rc.line(originX, originY, originX + chartW, originY, { stroke: color, strokeWidth: 2.5, roughness: 1.2 });

      // Title / Y Label
      ctx.fillStyle = '#334155';
      ctx.font = "bold 13px 'Outfit', sans-serif";
      ctx.textAlign = 'left';
      ctx.fillText(data.yLabel || 'Growth / Impact', originX, y + 16);

      const bars: { label: string; value: number; color: string }[] = data.bars || [];
      const barSpacing = chartW / (bars.length || 1);
      const barWidth = Math.min(50, barSpacing * 0.6);

      bars.forEach((b, idx) => {
        const bx = originX + idx * barSpacing + (barSpacing - barWidth) / 2;
        const bHeight = (b.value / 100) * chartH;
        const by = originY - bHeight;

        rc.rectangle(bx, by, barWidth, bHeight, {
          stroke: color,
          strokeWidth: 2,
          fill: b.color || '#2563eb',
          fillStyle: 'hachure',
          hachureGap: 5,
          roughness: 1.5,
        });

        // Value on top
        ctx.fillStyle = '#0f172a';
        ctx.font = "bold 14px 'Patrick Hand', cursive";
        ctx.textAlign = 'center';
        ctx.fillText(`${b.value}`, bx + barWidth / 2, by - 16);

        // Label below axis
        ctx.font = "13px 'Patrick Hand', cursive";
        ctx.fillStyle = '#475569';
        ctx.fillText(b.label, bx + barWidth / 2, originY + 18);
      });
      break;
    }

    case 'piechart': {
      // Donut / Pie Chart
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      ctx.fillStyle = '#1e293b';
      ctx.font = "bold 16px 'Outfit', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(data.title || 'Proportion Breakdown', x + width / 2, y + 24);

      const cx = x + width * 0.38;
      const cy = y + height * 0.58;
      const radius = Math.min(width, height) * 0.32;

      // Sketchy outer ring
      rc.circle(cx, cy, radius * 2, {
        stroke: color,
        strokeWidth: 2.2,
        roughness: 1.4,
      });

      // Draw Legend on right
      const slices = data.slices || [];
      const legX = x + width * 0.68;
      let legY = y + 70;

      slices.forEach((s: any) => {
        rc.rectangle(legX, legY, 16, 16, {
          fill: s.color,
          fillStyle: 'solid',
          stroke: color,
          strokeWidth: 1.5,
          roughness: 1,
        });
        ctx.textAlign = 'left';
        ctx.font = "14px 'Patrick Hand', cursive";
        ctx.fillStyle = '#1e293b';
        ctx.fillText(`${s.label} (${s.percent}%)`, legX + 24, legY + 13);
        legY += 34;
      });
      break;
    }

    case 'timeline': {
      // Milestone Timeline (When - Distinct Phased Steps)
      rc.rectangle(x, y, width, height, {
        stroke: '#cbd5e1',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const milestones = data.milestones || [];
      const lineY = y + height * 0.46;
      const startX = x + 45;
      const endX = x + width - 45;

      // Connecting flow line
      rc.line(startX, lineY, endX, lineY, {
        stroke: '#94a3b8',
        strokeWidth: 3,
        roughness: 1.2,
      });
      // End arrow
      rc.line(endX, lineY, endX - 14, lineY - 8, { stroke: '#64748b', strokeWidth: 2.5 });
      rc.line(endX, lineY, endX - 14, lineY + 8, { stroke: '#64748b', strokeWidth: 2.5 });

      const spacing = (endX - startX - 20) / (milestones.length || 1);

      // Distinct phase color palettes per step so every step has a unique identity
      const PHASE_PALETTES = [
        { stroke: '#4f46e5', fill: '#6366f1', glow: 'rgba(99, 102, 241, 0.16)', tagBg: '#eef2ff', tagText: '#4338ca', phase: 'Phase 1' },
        { stroke: '#0284c7', fill: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.16)', tagBg: '#e0f2fe', tagText: '#0369a1', phase: 'Phase 2' },
        { stroke: '#d97706', fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.16)', tagBg: '#fef3c7', tagText: '#b45309', phase: 'Phase 3' },
        { stroke: '#059669', fill: '#10b981', glow: 'rgba(16, 185, 129, 0.16)', tagBg: '#ecfdf5', tagText: '#047857', phase: 'Phase 4' },
        { stroke: '#7c3aed', fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.16)', tagBg: '#faf5ff', tagText: '#6d28d9', phase: 'Phase 5' },
      ];

      milestones.forEach((m: any, idx: number) => {
        const mx = startX + idx * spacing + spacing / 2;
        const pal = PHASE_PALETTES[idx % PHASE_PALETTES.length];

        // Soft glow ring
        rc.circle(mx, lineY, 44, {
          stroke: 'transparent',
          fill: pal.glow,
          fillStyle: 'solid',
        });

        // Milestone Node circle with distinctive phase coloring
        rc.circle(mx, lineY, 34, {
          stroke: pal.stroke,
          strokeWidth: 2.5,
          fill: pal.fill,
          fillStyle: 'solid',
          roughness: 1.3,
        });

        // Step number inside circle
        ctx.fillStyle = '#ffffff';
        ctx.font = "bold 15px 'Outfit', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${m.step || idx + 1}`, mx, lineY);

        // Phase pill badge above
        const phaseLabel = m.phase || pal.phase;
        ctx.fillStyle = pal.tagBg;
        ctx.beginPath();
        const badgeW = 62;
        const badgeH = 18;
        if (ctx.roundRect) {
          ctx.roundRect(mx - badgeW / 2, lineY - 50, badgeW, badgeH, 8);
        } else {
          ctx.rect(mx - badgeW / 2, lineY - 50, badgeW, badgeH);
        }
        ctx.fill();

        ctx.fillStyle = pal.tagText;
        ctx.font = "bold 10px 'Outfit', sans-serif";
        ctx.fillText(phaseLabel, mx, lineY - 41);

        // Date/Time pill
        ctx.fillStyle = '#475569';
        ctx.font = "bold 12px 'Outfit', sans-serif";
        ctx.fillText(m.time || '', mx, lineY - 24);

        // Title & Desc below
        ctx.fillStyle = '#0f172a';
        ctx.font = "bold 16px 'Patrick Hand', cursive";
        ctx.fillText(m.title || '', mx, lineY + 34);

        ctx.fillStyle = '#64748b';
        ctx.font = "12px 'Patrick Hand', cursive";
        ctx.fillText(m.desc || '', mx, lineY + 54);
      });
      break;
    }

    case 'flowchart': {
      // Step-by-step Flowchart (Distinct Steps & Badges)
      rc.rectangle(x, y, width, height, {
        stroke: '#cbd5e1',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const nodes = data.nodes || [];
      const nodeW = Math.min(125, (width - 40) / (nodes.length || 1) - 22);
      const nodeH = 70;
      const centerY = y + height / 2;
      const stepDist = (width - 60) / (nodes.length || 1);

      // Distinct themes per step position / type so steps never look identical
      const STEP_PALETTES = [
        { stroke: '#059669', fill: '#ecfdf5', badgeBg: '#10b981', badgeText: '#ffffff', defaultBadge: 'STEP 1 • INPUT', text: '#064e3b' },
        { stroke: '#2563eb', fill: '#eff6ff', badgeBg: '#3b82f6', badgeText: '#ffffff', defaultBadge: 'STEP 2 • ACTION', text: '#1e3a8a' },
        { stroke: '#d97706', fill: '#fffbeb', badgeBg: '#f59e0b', badgeText: '#ffffff', defaultBadge: 'STEP 3 • CHECK', text: '#78350f' },
        { stroke: '#7c3aed', fill: '#f5f3ff', badgeBg: '#8b5cf6', badgeText: '#ffffff', defaultBadge: 'STEP 4 • GOAL', text: '#4c1d95' },
      ];

      nodes.forEach((n: any, idx: number) => {
        const nx = x + 35 + idx * stepDist;
        const ny = centerY - nodeH / 2;
        const pal = STEP_PALETTES[idx % STEP_PALETTES.length];

        if (n.type === 'decision') {
          // Diamond shape with warm amber check styling
          const cx = nx + nodeW / 2;
          const cy = centerY;
          rc.polygon(
            [
              [cx, cy - nodeH / 2],
              [cx + nodeW / 2, cy],
              [cx, cy + nodeH / 2],
              [cx - nodeW / 2, cy],
            ],
            { stroke: '#d97706', strokeWidth: 2.4, fill: '#fef3c7', fillStyle: 'solid', roughness: 1.3 }
          );

          // Decision Step Badge above diamond
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          const bw = 66;
          const bh = 17;
          if (ctx.roundRect) {
            ctx.roundRect(cx - bw / 2, cy - nodeH / 2 - 12, bw, bh, 8);
          } else {
            ctx.rect(cx - bw / 2, cy - nodeH / 2 - 12, bw, bh);
          }
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = "bold 9px 'Outfit', sans-serif";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`DECISION ?`, cx, cy - nodeH / 2 - 3);

          // Decision text inside
          ctx.fillStyle = '#78350f';
          ctx.font = "bold 13px 'Patrick Hand', cursive";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(n.label, cx, cy);
        } else {
          // Process box with distinctive step color & theme
          const isStart = n.type === 'start' || idx === 0;
          const isEnd = n.type === 'end' || idx === nodes.length - 1;
          const strokeCol = isStart ? '#059669' : isEnd ? '#7c3aed' : pal.stroke;
          const fillCol = isStart ? '#ecfdf5' : isEnd ? '#f5f3ff' : pal.fill;
          const badgeBg = isStart ? '#10b981' : isEnd ? '#8b5cf6' : pal.badgeBg;
          const badgeText = isStart ? 'START • STEP 1' : isEnd ? 'GOAL • DONE' : `STEP ${idx + 1}`;
          const textCol = isStart ? '#064e3b' : isEnd ? '#4c1d95' : pal.text;

          rc.rectangle(nx, ny, nodeW, nodeH, {
            stroke: strokeCol,
            strokeWidth: 2.2,
            fill: fillCol,
            fillStyle: 'solid',
            roughness: 1.3,
          });

          // Step badge pill at top of box
          ctx.fillStyle = badgeBg;
          ctx.beginPath();
          const bw = Math.min(88, nodeW - 12);
          const bh = 16;
          if (ctx.roundRect) {
            ctx.roundRect(nx + (nodeW - bw) / 2, ny - 9, bw, bh, 8);
          } else {
            ctx.rect(nx + (nodeW - bw) / 2, ny - 9, bw, bh);
          }
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = "bold 9px 'Outfit', sans-serif";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, nx + nodeW / 2, ny - 1);

          // Node content label
          ctx.fillStyle = textCol;
          ctx.font = "bold 13px 'Patrick Hand', cursive";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(n.label, nx + nodeW / 2, centerY + 4);
        }

        // Connecting arrow to next node
        if (idx < nodes.length - 1) {
          const nextNx = x + 35 + (idx + 1) * stepDist;
          const arrowStartX = nx + nodeW + 4;
          const arrowEndX = nextNx - 4;
          const arrowColor = pal.stroke;
          rc.line(arrowStartX, centerY, arrowEndX, centerY, { stroke: arrowColor, strokeWidth: 2.2, roughness: 1.2 });
          rc.line(arrowEndX, centerY, arrowEndX - 8, centerY - 5, { stroke: arrowColor, strokeWidth: 2.2 });
          rc.line(arrowEndX, centerY, arrowEndX - 8, centerY + 5, { stroke: arrowColor, strokeWidth: 2.2 });
        }
      });
      break;
    }

    case 'balance': {
      // Balance Scale (Trade-off)
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const cx = x + width / 2;
      const fulcrumY = y + height - 70;

      // Fulcrum Triangle
      rc.polygon(
        [
          [cx, fulcrumY - 40],
          [cx + 25, fulcrumY + 20],
          [cx - 25, fulcrumY + 20],
        ],
        { stroke: color, strokeWidth: 2.5, fill: '#cbd5e1', fillStyle: 'solid', roughness: 1.3 }
      );

      // Tilted beam
      const beamW = width * 0.75;
      const angle = -0.06; // slight tilt favoring right side
      const leftX = cx - (beamW / 2) * Math.cos(angle);
      const leftY = fulcrumY - 40 - (beamW / 2) * Math.sin(angle);
      const rightX = cx + (beamW / 2) * Math.cos(angle);
      const rightY = fulcrumY - 40 + (beamW / 2) * Math.sin(angle);

      rc.line(leftX, leftY, rightX, rightY, { stroke: color, strokeWidth: 3.5, roughness: 1.2 });

      // Left pan
      rc.line(leftX, leftY, leftX - 16, leftY + 50, { stroke: '#94a3b8', strokeWidth: 1.5 });
      rc.line(leftX, leftY, leftX + 16, leftY + 50, { stroke: '#94a3b8', strokeWidth: 1.5 });
      rc.line(leftX - 35, leftY + 50, leftX + 35, leftY + 50, { stroke: color, strokeWidth: 2.5 });

      // Right pan
      rc.line(rightX, rightY, rightX - 16, rightY + 50, { stroke: '#94a3b8', strokeWidth: 1.5 });
      rc.line(rightX, rightY, rightX + 16, rightY + 50, { stroke: '#94a3b8', strokeWidth: 1.5 });
      rc.line(rightX - 35, rightY + 50, rightX + 35, rightY + 50, { stroke: color, strokeWidth: 2.5 });

      // Left item text
      ctx.textAlign = 'center';
      ctx.font = "bold 15px 'Outfit', sans-serif";
      ctx.fillStyle = '#dc2626';
      ctx.fillText(data.leftItem || 'Cost & Effort', leftX, leftY + 75);
      ctx.font = "13px 'Patrick Hand', cursive";
      ctx.fillStyle = '#64748b';
      ctx.fillText(data.leftWeight || 'Current Burden', leftX, leftY + 95);

      // Right item text
      ctx.font = "bold 15px 'Outfit', sans-serif";
      ctx.fillStyle = '#16a34a';
      ctx.fillText(data.rightItem || 'Future Growth', rightX, rightY + 75);
      ctx.font = "13px 'Patrick Hand', cursive";
      ctx.fillStyle = '#64748b';
      ctx.fillText(data.rightWeight || '10x Upside', rightX, rightY + 95);

      // Verdict badge
      ctx.font = "bold 15px 'Patrick Hand', cursive";
      ctx.fillStyle = '#0f172a';
      ctx.fillText(data.verdict || 'Decision: Worth it!', cx, y + 28);
      break;
    }

    case 'venn': {
      // 2-Circle Venn Diagram
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const radius = Math.min(width, height) * 0.35;
      const cy = y + height / 2;
      const c1X = x + width * 0.38;
      const c2X = x + width * 0.62;

      // Circle 1
      rc.circle(c1X, cy, radius * 2, {
        stroke: '#2563eb',
        strokeWidth: 2.5,
        fill: 'rgba(59, 130, 246, 0.1)',
        fillStyle: 'solid',
        roughness: 1.4,
      });

      // Circle 2
      rc.circle(c2X, cy, radius * 2, {
        stroke: '#059669',
        strokeWidth: 2.5,
        fill: 'rgba(16, 185, 129, 0.1)',
        fillStyle: 'solid',
        roughness: 1.4,
      });

      // Labels
      ctx.textAlign = 'center';
      ctx.font = "bold 15px 'Outfit', sans-serif";
      ctx.fillStyle = '#1d4ed8';
      ctx.fillText(data.leftLabel || 'What Users Love', c1X - 35, cy - 10);

      ctx.fillStyle = '#047857';
      ctx.fillText(data.rightLabel || 'What Is Feasible', c2X + 35, cy - 10);

      // Sweet Spot in intersection
      ctx.fillStyle = '#b45309';
      ctx.font = "bold 13px 'Patrick Hand', cursive";
      ctx.fillText(data.sweetSpot || 'SWEET SPOT', (c1X + c2X) / 2, cy);
      break;
    }

    case 'scurve': {
      // S-Curve Growth lifecycle
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const startX = x + 50;
      const endX = x + width - 40;
      const baseY = y + height - 50;
      const topY = y + 50;

      // Axes
      rc.line(startX, topY, startX, baseY, { stroke: color, strokeWidth: 2 });
      rc.line(startX, baseY, endX, baseY, { stroke: color, strokeWidth: 2 });

      // Sigmoid S-Curve path
      const curvePts: [number, number][] = [];
      const totalSteps = 40;
      for (let i = 0; i <= totalSteps; i++) {
        const t = (i / totalSteps) * 6 - 3; // -3 to 3
        const sig = 1 / (1 + Math.exp(-t));
        const px = startX + (i / totalSteps) * (endX - startX);
        const py = baseY - sig * (baseY - topY);
        curvePts.push([px, py]);
      }

      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(curvePts[0][0], curvePts[0][1]);
      for (let i = 1; i < curvePts.length; i++) {
        ctx.lineTo(curvePts[i][0], curvePts[i][1]);
      }
      ctx.stroke();
      ctx.restore();

      // Phases
      ctx.fillStyle = '#475569';
      ctx.font = "13px 'Patrick Hand', cursive";
      ctx.textAlign = 'center';
      const phases = data.phases || ['1. Inception', '2. Growth', '3. Scale'];
      ctx.fillText(phases[0], startX + 50, baseY + 20);
      ctx.fillText(phases[1], startX + (endX - startX) * 0.5, baseY + 20);
      ctx.fillText(phases[2], endX - 50, baseY + 20);

      // Inflection callout
      ctx.fillStyle = '#dc2626';
      ctx.font = "bold 13px 'Outfit', sans-serif";
      ctx.fillText(data.inflectionPoint || 'Inflection Point', startX + (endX - startX) * 0.5, topY + 40);
      break;
    }

    case 'stickmanScene': {
      // Stakeholder Trio
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const chars = data.characters || [];
      const cardW = (width - 40) / (chars.length || 1);

      chars.forEach((c: any, i: number) => {
        const cx = x + 20 + i * cardW + cardW / 2;

        // Stickman head & body
        rc.circle(cx, y + 60, 36, { stroke: color, strokeWidth: 2, roughness: 1.4 });
        rc.line(cx, y + 78, cx, y + 130, { stroke: color, strokeWidth: 2.2 });
        // Arms
        rc.line(cx - 24, y + 96, cx + 24, y + 96, { stroke: color, strokeWidth: 2 });
        // Legs
        rc.line(cx, y + 130, cx - 20, y + 175, { stroke: color, strokeWidth: 2 });
        rc.line(cx, y + 130, cx + 20, y + 175, { stroke: color, strokeWidth: 2 });

        // Emoji badge
        ctx.font = "22px sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText(c.emoji || '🧑‍💻', cx, y + 66);

        // Role title
        ctx.font = "bold 16px 'Outfit', sans-serif";
        ctx.fillStyle = '#0f172a';
        ctx.fillText(c.role, cx, y + 205);

        // Note
        ctx.font = "14px 'Patrick Hand', cursive";
        ctx.fillStyle = '#64748b';
        ctx.fillText(c.note, cx, y + 230);
      });
      break;
    }
  }

  // Render optional semantic tag badge
  if (model.tag) {
    renderSemanticBadge(ctx, x + 8, y - 6, model);
  }

  ctx.restore();
}

/**
 * Render visual vocabulary stamp
 */
export function renderStamp(
  ctx: CanvasRenderingContext2D,
  rc: any,
  stamp: StampElement
) {
  ctx.save();
  const { x, y, size, color, stampIcon, label } = stamp;

  // Themed color palettes so each stamp has a distinctive visual personality
  const STAMP_PALETTES: Record<string, { stroke: string; fill: string }> = {
    user: { stroke: '#2563eb', fill: '#eff6ff' },
    users: { stroke: '#4f46e5', fill: '#eef2ff' },
    smile: { stroke: '#16a34a', fill: '#f0fdf4' },
    frown: { stroke: '#dc2626', fill: '#fef2f2' },
    sparkles: { stroke: '#d97706', fill: '#fefce8' },
    lightbulb: { stroke: '#d97706', fill: '#fef9c3' },
    target: { stroke: '#e11d48', fill: '#fff1f2' },
    zap: { stroke: '#ea580c', fill: '#fff7ed' },
    shield: { stroke: '#1d4ed8', fill: '#eff6ff' },
    key: { stroke: '#b45309', fill: '#fffbeb' },
    gear: { stroke: '#475569', fill: '#f1f5f9' },
    check: { stroke: '#15803d', fill: '#f0fdf4' },
    alert: { stroke: '#d97706', fill: '#fffbeb' },
    flag: { stroke: '#7e22ce', fill: '#faf5ff' },
    dollar: { stroke: '#15803d', fill: '#ecfdf5' },
    'arrow-right': { stroke: '#0284c7', fill: '#f0f9ff' },
    'arrow-up-right': { stroke: '#059669', fill: '#ecfdf5' },
    repeat: { stroke: '#0284c7', fill: '#f0f9ff' },
    'message-circle': { stroke: '#6366f1', fill: '#eef2ff' },
  };

  const pal = STAMP_PALETTES[stampIcon];
  const activeStroke = (color === '#1e293b' || !color) && pal ? pal.stroke : color;
  const activeFill = stamp.fillColor || (pal ? pal.fill : 'rgba(248, 250, 252, 0.95)');

  // Background circle sticker with hand-drawn rough border
  rc.circle(x + size / 2, y + size / 2, size, {
    stroke: activeStroke,
    strokeWidth: 2.2,
    fill: activeFill,
    fillStyle: 'solid',
    roughness: 1.3,
  });

  // Visual glyph rendering
  ctx.strokeStyle = activeStroke;
  ctx.fillStyle = activeStroke;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.28;

  if (stampIcon === 'user') {
    // Single Stick Person
    const headR = r * 0.38;
    const headY = cy - r * 0.6;
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.stroke();
    // Spine
    const neckY = headY + headR;
    const pelvisY = cy + r * 0.35;
    ctx.beginPath();
    ctx.moveTo(cx, neckY);
    ctx.lineTo(cx, pelvisY);
    // Arms
    const armY = neckY + (pelvisY - neckY) * 0.35;
    ctx.moveTo(cx - r * 0.75, armY - 2);
    ctx.lineTo(cx, armY);
    ctx.lineTo(cx + r * 0.75, armY - 2);
    // Legs
    ctx.moveTo(cx, pelvisY);
    ctx.lineTo(cx - r * 0.55, cy + r * 0.95);
    ctx.moveTo(cx, pelvisY);
    ctx.lineTo(cx + r * 0.55, cy + r * 0.95);
    ctx.stroke();
  } else if (stampIcon === 'users') {
    // Two Stick People (Team / Crowd)
    const p1X = cx - r * 0.45;
    const p2X = cx + r * 0.45;
    const headR = r * 0.3;
    const headY = cy - r * 0.55;

    // Person 1
    ctx.beginPath();
    ctx.arc(p1X, headY, headR, 0, Math.PI * 2);
    ctx.moveTo(p1X, headY + headR);
    ctx.lineTo(p1X, cy + r * 0.3);
    ctx.moveTo(p1X - r * 0.5, cy - r * 0.1);
    ctx.lineTo(p1X + r * 0.4, cy - r * 0.1);
    ctx.moveTo(p1X, cy + r * 0.3);
    ctx.lineTo(p1X - r * 0.4, cy + r * 0.9);
    ctx.moveTo(p1X, cy + r * 0.3);
    ctx.lineTo(p1X + r * 0.3, cy + r * 0.9);
    ctx.stroke();

    // Person 2
    ctx.beginPath();
    ctx.arc(p2X, headY, headR, 0, Math.PI * 2);
    ctx.moveTo(p2X, headY + headR);
    ctx.lineTo(p2X, cy + r * 0.3);
    ctx.moveTo(p2X - r * 0.4, cy - r * 0.1);
    ctx.lineTo(p2X + r * 0.5, cy - r * 0.1);
    ctx.moveTo(p2X, cy + r * 0.3);
    ctx.lineTo(p2X - r * 0.3, cy + r * 0.9);
    ctx.moveTo(p2X, cy + r * 0.3);
    ctx.lineTo(p2X + r * 0.4, cy + r * 0.9);
    ctx.stroke();
  } else if (stampIcon === 'smile') {
    // Happy Face
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    // Eyes
    ctx.fillRect(cx - r * 0.45, cy - r * 0.3, 3, 3);
    ctx.fillRect(cx + r * 0.35, cy - r * 0.3, 3, 3);
    // Smile arc
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.1, r * 0.55, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else if (stampIcon === 'frown') {
    // Pain Point / Sad Face
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillRect(cx - r * 0.45, cy - r * 0.25, 3, 3);
    ctx.fillRect(cx + r * 0.35, cy - r * 0.25, 3, 3);
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.55, r * 0.5, 1.15 * Math.PI, 1.85 * Math.PI);
    ctx.stroke();
  } else if (stampIcon === 'sparkles') {
    // Magic Sparkles (Delight)
    // Center 4-point star
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.quadraticCurveTo(cx, cy, cx + r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + r);
    ctx.quadraticCurveTo(cx, cy, cx - r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - r);
    ctx.stroke();
    // Little sparkle dots
    ctx.beginPath();
    ctx.arc(cx + r * 0.8, cy - r * 0.7, 2, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.7, cy + r * 0.6, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (stampIcon === 'lightbulb') {
    // Lightbulb (Idea / Insight)
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.25, r * 0.75, 0.75 * Math.PI, 0.25 * Math.PI);
    ctx.lineTo(cx + r * 0.35, cy + r * 0.55);
    ctx.lineTo(cx - r * 0.35, cy + r * 0.55);
    ctx.closePath();
    ctx.stroke();
    // Screw base
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.25, cy + r * 0.7);
    ctx.lineTo(cx + r * 0.25, cy + r * 0.7);
    ctx.moveTo(cx - r * 0.15, cy + r * 0.85);
    ctx.lineTo(cx + r * 0.15, cy + r * 0.85);
    ctx.stroke();
    // Rays
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.15);
    ctx.lineTo(cx, cy - r * 1.4);
    ctx.moveTo(cx - r * 0.9, cy - r * 0.85);
    ctx.lineTo(cx - r * 1.15, cy - r * 1.05);
    ctx.moveTo(cx + r * 0.9, cy - r * 0.85);
    ctx.lineTo(cx + r * 1.15, cy - r * 1.05);
    ctx.stroke();
  } else if (stampIcon === 'target') {
    // Target / Goal
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (stampIcon === 'zap') {
    // Lightning Zap (Energy / Trigger)
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.15, cy - r * 1.1);
    ctx.lineTo(cx - r * 0.65, cy);
    ctx.lineTo(cx + r * 0.1, cy);
    ctx.lineTo(cx - r * 0.15, cy + r * 1.1);
    ctx.lineTo(cx + r * 0.65, cy - r * 0.1);
    ctx.lineTo(cx - r * 0.1, cy - r * 0.1);
    ctx.closePath();
    ctx.stroke();
  } else if (stampIcon === 'shield') {
    // Trust / Shield
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.85, cy - r * 0.85);
    ctx.lineTo(cx + r * 0.85, cy - r * 0.85);
    ctx.lineTo(cx + r * 0.85, cy);
    ctx.quadraticCurveTo(cx + r * 0.7, cy + r * 0.8, cx, cy + r * 1.05);
    ctx.quadraticCurveTo(cx - r * 0.7, cy + r * 0.8, cx - r * 0.85, cy);
    ctx.closePath();
    ctx.stroke();
    // Center line
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.85);
    ctx.lineTo(cx, cy + r * 0.85);
    ctx.stroke();
  } else if (stampIcon === 'key') {
    // Key (Key Factor)
    ctx.beginPath();
    ctx.arc(cx - r * 0.45, cy - r * 0.45, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.1, cy - r * 0.1);
    ctx.lineTo(cx + r * 0.85, cy + r * 0.85);
    // Teeth
    ctx.moveTo(cx + r * 0.55, cy + r * 0.55);
    ctx.lineTo(cx + r * 0.75, cy + r * 0.35);
    ctx.moveTo(cx + r * 0.8, cy + r * 0.8);
    ctx.lineTo(cx + r * 0.95, cy + r * 0.65);
    ctx.stroke();
  } else if (stampIcon === 'gear') {
    // Gear / System
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    // 6 Teeth
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x1 = cx + r * 0.7 * Math.cos(a - 0.2);
      const y1 = cy + r * 0.7 * Math.sin(a - 0.2);
      const x2 = cx + r * 1.05 * Math.cos(a - 0.15);
      const y2 = cy + r * 1.05 * Math.sin(a - 0.15);
      const x3 = cx + r * 1.05 * Math.cos(a + 0.15);
      const y3 = cy + r * 1.05 * Math.sin(a + 0.15);
      const x4 = cx + r * 0.7 * Math.cos(a + 0.2);
      const y4 = cy + r * 0.7 * Math.sin(a + 0.2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.stroke();
    }
  } else if (stampIcon === 'check') {
    // Validated Checkmark
    ctx.beginPath();
    ctx.lineWidth = 3.5;
    ctx.moveTo(cx - r * 0.75, cy + r * 0.05);
    ctx.lineTo(cx - r * 0.15, cy + r * 0.65);
    ctx.lineTo(cx + r * 0.85, cy - r * 0.65);
    ctx.stroke();
  } else if (stampIcon === 'alert') {
    // Hazard / Risk Triangle with !
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.05);
    ctx.lineTo(cx + r * 1.05, cy + r * 0.85);
    ctx.lineTo(cx - r * 1.05, cy + r * 0.85);
    ctx.closePath();
    ctx.stroke();
    // Exclamation mark
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.5);
    ctx.lineTo(cx, cy + r * 0.2);
    ctx.stroke();
    ctx.fillRect(cx - 1.5, cy + r * 0.45, 3, 3);
  } else if (stampIcon === 'flag') {
    // Milestone Flag
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.65, cy + r * 1.05);
    ctx.lineTo(cx - r * 0.65, cy - r * 1.05);
    ctx.stroke();
    // Flag banner
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.65, cy - r * 1.05);
    ctx.lineTo(cx + r * 0.85, cy - r * 0.55);
    ctx.lineTo(cx - r * 0.65, cy - r * 0.05);
    ctx.closePath();
    ctx.stroke();
  } else if (stampIcon === 'dollar') {
    // Value / Revenue ($)
    ctx.font = `bold ${Math.round(r * 2)}px 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', cx, cy);
  } else if (stampIcon === 'arrow-right') {
    // Process Arrow Right
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.9, cy);
    ctx.lineTo(cx + r * 0.9, cy);
    ctx.lineTo(cx + r * 0.35, cy - r * 0.55);
    ctx.moveTo(cx + r * 0.9, cy);
    ctx.lineTo(cx + r * 0.35, cy + r * 0.55);
    ctx.stroke();
  } else if (stampIcon === 'arrow-up-right') {
    // Growth Trend
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.85, cy + r * 0.85);
    ctx.lineTo(cx + r * 0.85, cy - r * 0.85);
    ctx.lineTo(cx + r * 0.25, cy - r * 0.85);
    ctx.moveTo(cx + r * 0.85, cy - r * 0.85);
    ctx.lineTo(cx + r * 0.85, cy - r * 0.25);
    ctx.stroke();
  } else if (stampIcon === 'repeat') {
    // Loop / Cycle
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.75, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
    // Arrowhead on loop
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.75, cy + r * 0.4);
    ctx.lineTo(cx + r * 0.75, cy);
    ctx.lineTo(cx + r * 1.1, cy);
    ctx.stroke();
  } else if (stampIcon === 'message-circle') {
    // Speech Bubble
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.15, r * 0.85, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(cx - r * 0.75, cy + r * 0.9);
    ctx.lineTo(cx - r * 0.25, cy + r * 0.65);
    ctx.closePath();
    ctx.stroke();
  } else {
    // Default Star
    ctx.beginPath();
    const outerR = r * 0.9;
    const innerR = r * 0.45;
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const px = cx + radius * Math.cos(angle);
      const py = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Stamp Label below
  if (label) {
    ctx.fillStyle = '#1e293b';
    ctx.font = "bold 13px 'Patrick Hand', cursive";
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, y + size + 16);
  }

  // Render optional semantic tag badge
  if (stamp.tag) {
    renderSemanticBadge(ctx, x, y - 6, stamp);
  }

  ctx.restore();
}
