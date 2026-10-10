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
export const NAPKIN_WORLD_WIDTH = 1600;
export const NAPKIN_WORLD_HEIGHT = 1000;

/**
 * Render canvas background texture.
 * When pan & zoom are provided (interactive canvas), renders an authentic physical sheet in world coordinates
 * surrounded by an ambient cafe tabletop with dynamic scrolling grid/grain.
 * When omitted (export engine / thumbnails), renders full-bleed across (0, 0, width, height).
 */
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  texture: PaperTexture,
  pan?: { x: number; y: number },
  zoom?: number
) {
  ctx.save();

  // If interactive mode (pan & zoom provided)
  if (pan !== undefined && zoom !== undefined) {
    const sheetW = NAPKIN_WORLD_WIDTH;
    const sheetH = NAPKIN_WORLD_HEIGHT;

    if (texture === 'blueprint') {
      // Deep technical navy backdrop
      ctx.fillStyle = '#060e1c';
      ctx.fillRect(0, 0, width, height);

      // Dynamic blueprint grid moving with pan & zoom
      const step = 28 * zoom;
      if (step >= 8) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        const offsetX = ((pan.x % step) + step) % step;
        const offsetY = ((pan.y % step) + step) % step;
        ctx.beginPath();
        for (let x = offsetX; x < width; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = offsetY; y < height; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Major grid lines
        const majorStep = step * 4;
        const majorOffsetX = ((pan.x % majorStep) + majorStep) % majorStep;
        const majorOffsetY = ((pan.y % majorStep) + majorStep) % majorStep;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = majorOffsetX; x < width; x += majorStep) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = majorOffsetY; y < height; y += majorStep) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      // Draw Blueprint Sheet in World Coordinates
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Sheet shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 12;

      ctx.fillStyle = '#0a1628';
      ctx.fillRect(0, 0, sheetW, sheetH);

      ctx.shadowColor = 'transparent';

      // Sheet internal grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.lineWidth = 1;
      const bStep = 28;
      ctx.beginPath();
      for (let x = 0; x <= sheetW; x += bStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, sheetH);
      }
      for (let y = 0; y <= sheetH; y += bStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(sheetW, y);
      }
      ctx.stroke();

      // Outer blueprint border & corner guides
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 16, sheetW - 32, sheetH - 32);

      ctx.font = "bold 13px 'Outfit', sans-serif";
      ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.textAlign = 'right';
      ctx.fillText('📐 BLUEPRINT NAPKIN SHEET • 1600 × 1000', sheetW - 28, sheetH - 26);

      ctx.restore();
    } else if (texture === 'grid') {
      // Slate desk table background
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, width, height);

      // Subtle dynamic desk grid moving with pan & zoom
      const step = 24 * zoom;
      if (step >= 8) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
        const offsetX = ((pan.x % step) + step) % step;
        const offsetY = ((pan.y % step) + step) % step;
        for (let x = offsetX; x < width; x += step) {
          for (let y = offsetY; y < height; y += step) {
            ctx.fillRect(x, y, 1.5, 1.5);
          }
        }
      }

      // Draw Grid Paper Sheet in World Coordinates
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheetW, sheetH);

      ctx.shadowColor = 'transparent';

      // Fine grid on sheet
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
      ctx.lineWidth = 1;
      const gStep = 20;
      ctx.beginPath();
      for (let x = 0; x <= sheetW; x += gStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, sheetH);
      }
      for (let y = 0; y <= sheetH; y += gStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(sheetW, y);
      }
      ctx.stroke();

      // Major grid
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.22)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= sheetW; x += gStep * 5) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, sheetH);
      }
      for (let y = 0; y <= sheetH; y += gStep * 5) {
        ctx.moveTo(0, y);
        ctx.lineTo(sheetW, y);
      }
      ctx.stroke();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, sheetW, sheetH);

      ctx.font = "italic 13px 'Patrick Hand', cursive";
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText('📐 Dot Grid Napkin Sheet • 1600 × 1000', sheetW - 24, sheetH - 22);

      ctx.restore();
    } else if (texture === 'kraft') {
      // Warm dark cafe wood desk
      ctx.fillStyle = '#caa983';
      ctx.fillRect(0, 0, width, height);

      // Subtle table plank grain moving with pan
      const step = 36 * zoom;
      ctx.fillStyle = 'rgba(100, 65, 30, 0.05)';
      const offsetY = ((pan.y % step) + step) % step;
      for (let y = offsetY; y < height; y += step) {
        ctx.fillRect(0, y, width, 1.5);
      }

      // Draw Kraft Napkin Sheet in World Coordinates
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      ctx.shadowColor = 'rgba(60, 35, 15, 0.28)';
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 12;

      ctx.fillStyle = '#eddcc4';
      ctx.fillRect(0, 0, sheetW, sheetH);

      ctx.shadowColor = 'transparent';

      // Kraft paper fiber flecks
      ctx.fillStyle = 'rgba(140, 95, 55, 0.12)';
      const dotStep = 24;
      for (let x = dotStep / 2; x < sheetW; x += dotStep) {
        for (let y = dotStep / 2; y < sheetH; y += dotStep) {
          ctx.fillRect(x + ((y % 48 === 0) ? 8 : 0), y, 2, 1.5);
        }
      }

      // Outer cafe kraft embossed border
      ctx.strokeStyle = 'rgba(150, 105, 65, 0.25)';
      ctx.lineWidth = 3;
      ctx.strokeRect(18, 18, sheetW - 36, sheetH - 36);

      ctx.fillStyle = 'rgba(140, 95, 55, 0.4)';
      ctx.font = "italic 14px 'Patrick Hand', cursive";
      ctx.textAlign = 'right';
      ctx.fillText('☕ Café Kraft Napkin • 1600 × 1000', sheetW - 30, sheetH - 26);

      ctx.restore();
    } else if (texture === 'clean') {
      // Clean modern neutral studio background
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, width, height);

      // Moving desk dots
      const step = 24 * zoom;
      if (step >= 8) {
        ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
        const offsetX = ((pan.x % step) + step) % step;
        const offsetY = ((pan.y % step) + step) % step;
        for (let x = offsetX; x < width; x += step) {
          for (let y = offsetY; y < height; y += step) {
            ctx.fillRect(x, y, 1.5, 1.5);
          }
        }
      }

      // Clean White Paper Sheet
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 8;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheetW, sheetH);

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, sheetW, sheetH);

      ctx.restore();
    } else {
      // 'napkin' - Authentic Dan Roam Back of the Napkin
      // Surrounding cafe table background
      ctx.fillStyle = '#d3c2a6';
      ctx.fillRect(0, 0, width, height);

      // Ambient cafe tabletop pattern moving with pan & zoom
      const step = 28 * zoom;
      if (step >= 8) {
        ctx.fillStyle = 'rgba(120, 85, 45, 0.05)';
        const offsetX = ((pan.x % step) + step) % step;
        const offsetY = ((pan.y % step) + step) % step;
        for (let x = offsetX; x < width; x += step) {
          ctx.fillRect(x, 0, 1, height);
        }
        for (let y = offsetY; y < height; y += step) {
          ctx.fillRect(0, y, width, 1);
        }
      }

      // Render physical Dan Roam Napkin Sheet in World Coordinates
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Realistic soft organic drop shadow on cafe tabletop
      ctx.shadowColor = 'rgba(50, 30, 10, 0.24)';
      ctx.shadowBlur = 36;
      ctx.shadowOffsetY = 14;

      const napkinGrad = ctx.createLinearGradient(0, 0, sheetW, sheetH);
      napkinGrad.addColorStop(0, '#fcf8ee');
      napkinGrad.addColorStop(0.35, '#f7f0df');
      napkinGrad.addColorStop(0.7, '#f4ebd7');
      napkinGrad.addColorStop(1, '#eee2cb');
      ctx.fillStyle = napkinGrad;
      ctx.fillRect(0, 0, sheetW, sheetH);

      ctx.shadowColor = 'transparent';

      // Subtle radial table vignette
      const vignette = ctx.createRadialGradient(
        sheetW / 2, sheetH / 2, Math.min(sheetW, sheetH) * 0.3,
        sheetW / 2, sheetH / 2, Math.max(sheetW, sheetH) * 0.75
      );
      vignette.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      vignette.addColorStop(0.65, 'rgba(215, 195, 165, 0.08)');
      vignette.addColorStop(1, 'rgba(175, 145, 110, 0.22)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, sheetW, sheetH);

      // Tactile cloth & paper fiber cross-weave pattern
      ctx.fillStyle = 'rgba(145, 115, 80, 0.055)';
      const weaveStep = 14;
      for (let y = 10; y < sheetH - 10; y += weaveStep) {
        ctx.fillRect(10, y, sheetW - 20, 0.8);
      }
      for (let x = 10; x < sheetW - 10; x += weaveStep) {
        ctx.fillRect(x, 10, 0.8, sheetH - 20);
      }

      // Organic natural paper pulp grain flecks
      ctx.fillStyle = 'rgba(135, 105, 70, 0.09)';
      for (let x = 20; x < sheetW - 20; x += 32) {
        for (let y = 20; y < sheetH - 20; y += 32) {
          const ox = ((x * 19 + y * 29) % 23) - 11;
          const oy = ((x * 23 + y * 13) % 23) - 11;
          ctx.fillRect(x + ox, y + oy, 2, 1.4);
        }
      }

      // Embossed crimped napkin borders (waffle pattern)
      const crimp1 = 18;
      const crimp2 = 28;
      const dotSpacing = 12;
      ctx.fillStyle = 'rgba(150, 120, 85, 0.28)';
      for (let x = crimp1; x < sheetW - crimp1; x += dotSpacing) {
        ctx.fillRect(x, crimp1, 2.5, 2.5);
        ctx.fillRect(x + 6, crimp2, 2.5, 2.5);
        ctx.fillRect(x, sheetH - crimp1 - 2.5, 2.5, 2.5);
        ctx.fillRect(x + 6, sheetH - crimp2 - 2.5, 2.5, 2.5);
      }
      for (let y = crimp1; y < sheetH - crimp1; y += dotSpacing) {
        ctx.fillRect(crimp1, y, 2.5, 2.5);
        ctx.fillRect(crimp2, y + 6, 2.5, 2.5);
        ctx.fillRect(sheetW - crimp1 - 2.5, y, 2.5, 2.5);
        ctx.fillRect(sheetW - crimp2 - 2.5, y + 6, 2.5, 2.5);
      }

      // Outer embossed pressed edge grooves
      ctx.strokeStyle = 'rgba(155, 125, 90, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 14, sheetW - 28, sheetH - 28);

      // Inner embossed stitch line with light bevel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(15, 15, sheetW - 30, sheetH - 30);

      ctx.strokeStyle = 'rgba(150, 120, 85, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(34, 34, sheetW - 68, sheetH - 68);
      ctx.setLineDash([]);

      // Folded paper creases (center vertical & horizontal quarter-folds)
      const midX = sheetW / 2;
      const midY = sheetH / 2;

      ctx.strokeStyle = 'rgba(130, 100, 65, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(midX, 14);
      ctx.lineTo(midX, sheetH - 14);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(midX + 2, 14);
      ctx.lineTo(midX + 2, sheetH - 14);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(130, 100, 65, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, midY);
      ctx.lineTo(sheetW - 14, midY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(14, midY + 2);
      ctx.lineTo(sheetW - 14, midY + 2);
      ctx.stroke();

      // Faint authentic cafe coffee ring watermark in top right
      const coffeeX = sheetW - 120;
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
      ctx.fillText('☕ The Back of the Napkin • Dan Roam Academy', sheetW - 42, sheetH - 38);

      ctx.restore();
    }

    ctx.restore();
    return;
  }

  // Fallback / Export mode: full bleed across width and height
  if (texture === 'blueprint') {
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, width, height);

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
    ctx.fillStyle = '#eddcc4';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(140, 95, 55, 0.12)';
    const dotStep = 24;
    for (let x = dotStep / 2; x < width; x += dotStep) {
      for (let y = dotStep / 2; y < height; y += dotStep) {
        ctx.fillRect(x + ((y % 48 === 0) ? 8 : 0), y, 2, 1.5);
      }
    }

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
    const napkinGrad = ctx.createLinearGradient(0, 0, width, height);
    napkinGrad.addColorStop(0, '#fcf8ee');
    napkinGrad.addColorStop(0.35, '#f7f0df');
    napkinGrad.addColorStop(0.7, '#f4ebd7');
    napkinGrad.addColorStop(1, '#eee2cb');
    ctx.fillStyle = napkinGrad;
    ctx.fillRect(0, 0, width, height);

    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.max(width, height) * 0.75
    );
    vignette.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    vignette.addColorStop(0.65, 'rgba(215, 195, 165, 0.08)');
    vignette.addColorStop(1, 'rgba(175, 145, 110, 0.22)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(145, 115, 80, 0.055)';
    const weaveStep = 14;
    for (let y = 10; y < height - 10; y += weaveStep) {
      ctx.fillRect(10, y, width - 20, 0.8);
    }
    for (let x = 10; x < width - 10; x += weaveStep) {
      ctx.fillRect(x, 10, 0.8, height - 20);
    }

    ctx.fillStyle = 'rgba(135, 105, 70, 0.09)';
    for (let x = 20; x < width - 20; x += 32) {
      for (let y = 20; y < height - 20; y += 32) {
        const ox = ((x * 19 + y * 29) % 23) - 11;
        const oy = ((x * 23 + y * 13) % 23) - 11;
        ctx.fillRect(x + ox, y + oy, 2, 1.4);
      }
    }

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

    ctx.strokeStyle = 'rgba(155, 125, 90, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, width - 28, height - 28);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    ctx.strokeStyle = 'rgba(150, 120, 85, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(34, 34, width - 68, height - 68);
    ctx.setLineDash([]);

    const midX = width / 2;
    const midY = height / 2;

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

    ctx.fillStyle = 'rgba(140, 110, 80, 0.5)';
    ctx.font = "italic 14px 'Patrick Hand', cursive";
    ctx.textAlign = 'right';
    ctx.fillText('☕ The Back of the Napkin • Dan Roam Academy', width - 42, height - 38);
  }

  ctx.restore();
}

/**
 * Render a pressure-sensitive, variable-width freehand stroke
 * Produces organic napkin felt-pen and marker ink with smooth quadratic contours and round endcaps
 */
export function renderPressureStroke(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number; pressure?: number }[],
  color: string,
  baseWidth: number,
  isHighlighter: boolean = false
) {
  if (pts.length === 0) return;

  if (pts.length === 1) {
    const p = pts[0];
    const pr = p.pressure !== undefined ? p.pressure : 0.5;
    const factor = isHighlighter ? (0.7 + 0.6 * pr) : (0.35 + 1.3 * pr);
    const r = Math.max(1, (baseWidth * factor) / 2);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    return;
  }

  // 1. Calculate per-point radius based on pressure and natural stroke entry/exit tapering
  const count = pts.length;
  const rawRadii: number[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const pr = pts[i].pressure !== undefined ? pts[i].pressure! : 0.5;
    // Felt pen: dynamic range from 35% to 165% of base width
    // Highlighter: broad chisel, 75% to 150%
    const factor = isHighlighter
      ? (Math.max(16, baseWidth * 4) * (0.75 + 0.5 * pr)) / (baseWidth * 2)
      : (0.35 + 1.3 * pr);

    let r = Math.max(0.75, (baseWidth * factor) / 2);

    // Natural entry and lift-off tapering at stroke terminals
    if (count > 3) {
      if (i === 0) r = Math.max(0.75, r * 0.55);
      else if (i === 1) r = Math.max(0.75, r * 0.8);
      else if (i === count - 1) r = Math.max(0.75, r * 0.55);
      else if (i === count - 2) r = Math.max(0.75, r * 0.8);
    }

    rawRadii[i] = r;
  }

  // 2. Smooth radii across neighboring points with 3-point Gaussian kernel to prevent sudden bumps
  const radii: number[] = new Array(count);
  for (let i = 0; i < count; i++) {
    if (i === 0 || i === count - 1 || count <= 2) {
      radii[i] = rawRadii[i];
    } else {
      radii[i] = rawRadii[i - 1] * 0.25 + rawRadii[i] * 0.5 + rawRadii[i + 1] * 0.25;
    }
  }

  // 3. Compute continuous normal vectors along the spine
  const leftPts: { x: number; y: number }[] = new Array(count);
  const rightPts: { x: number; y: number }[] = new Array(count);

  for (let i = 0; i < count; i++) {
    let tanX = 0;
    let tanY = 0;

    if (i === 0) {
      tanX = pts[1].x - pts[0].x;
      tanY = pts[1].y - pts[0].y;
    } else if (i === count - 1) {
      tanX = pts[count - 1].x - pts[count - 2].x;
      tanY = pts[count - 1].y - pts[count - 2].y;
    } else {
      tanX = pts[i + 1].x - pts[i - 1].x;
      tanY = pts[i + 1].y - pts[i - 1].y;
    }

    const len = Math.hypot(tanX, tanY);
    let nx = 0;
    let ny = 1;
    if (len > 0.0001) {
      nx = -tanY / len;
      ny = tanX / len;
    }

    const r = radii[i];
    leftPts[i] = { x: pts[i].x + nx * r, y: pts[i].y + ny * r };
    rightPts[i] = { x: pts[i].x - nx * r, y: pts[i].y - ny * r };
  }

  // 4. Build smooth outline polygon
  ctx.beginPath();

  // Round cap at start
  const startP = pts[0];
  const startR = radii[0];
  const startAngle = Math.atan2(leftPts[0].y - startP.y, leftPts[0].x - startP.x);
  const startEndAngle = Math.atan2(rightPts[0].y - startP.y, rightPts[0].x - startP.x);
  ctx.arc(startP.x, startP.y, startR, startEndAngle, startAngle, false);

  // Left curve spine forward
  ctx.lineTo(leftPts[0].x, leftPts[0].y);
  for (let i = 1; i < count; i++) {
    const xc = (leftPts[i - 1].x + leftPts[i].x) / 2;
    const yc = (leftPts[i - 1].y + leftPts[i].y) / 2;
    ctx.quadraticCurveTo(leftPts[i - 1].x, leftPts[i - 1].y, xc, yc);
  }
  ctx.lineTo(leftPts[count - 1].x, leftPts[count - 1].y);

  // Round cap at end
  const endP = pts[count - 1];
  const endR = radii[count - 1];
  const endStartAngle = Math.atan2(leftPts[count - 1].y - endP.y, leftPts[count - 1].x - endP.x);
  const endFinishAngle = Math.atan2(rightPts[count - 1].y - endP.y, rightPts[count - 1].x - endP.x);
  ctx.arc(endP.x, endP.y, endR, endStartAngle, endFinishAngle, false);

  // Right curve spine backward
  ctx.lineTo(rightPts[count - 1].x, rightPts[count - 1].y);
  for (let i = count - 2; i >= 0; i--) {
    const xc = (rightPts[i + 1].x + rightPts[i].x) / 2;
    const yc = (rightPts[i + 1].y + rightPts[i].y) / 2;
    ctx.quadraticCurveTo(rightPts[i + 1].x, rightPts[i + 1].y, xc, yc);
  }
  ctx.lineTo(rightPts[0].x, rightPts[0].y);

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Render freehand strokes (felt pen & highlighter)
 */
export function renderStroke(ctx: CanvasRenderingContext2D, stroke: StrokeElement) {
  if (stroke.points.length === 0) return;

  ctx.save();
  if (stroke.rotation && stroke.points.length > 0) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of stroke.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    ctx.translate(cx, cy);
    ctx.rotate(stroke.rotation);
    ctx.translate(-cx, -cy);
  }

  // Check if stroke contains dynamic stylus pressure modulation
  const hasPressureDynamics =
    stroke.hasPressure ||
    (stroke.points.length > 1 &&
      stroke.points.some((p) => p.pressure !== undefined && p.pressure > 0 && Math.abs(p.pressure - 0.5) > 0.03));

  if (hasPressureDynamics) {
    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.38;
      ctx.globalCompositeOperation = 'multiply';
      renderPressureStroke(ctx, stroke.points, stroke.color, stroke.width, true);
    } else {
      ctx.globalAlpha = 0.95;
      renderPressureStroke(ctx, stroke.points, stroke.color, stroke.width, false);
    }
    ctx.restore();
    return;
  }

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
  if (conn.rotation) {
    const cx = (conn.fromPoint.x + conn.toPoint.x) / 2;
    const cy = (conn.fromPoint.y + conn.toPoint.y) / 2;
    ctx.translate(cx, cy);
    ctx.rotate(conn.rotation);
    ctx.translate(-cx, -cy);
  }
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
  if (shape.rotation) {
    const isLineLike = (shape.shapeType === 'arrow' || shape.shapeType === 'line') && shape.startPoint && shape.endPoint;
    const cx = isLineLike ? (shape.startPoint!.x + shape.endPoint!.x) / 2 : shape.x + shape.width / 2;
    const cy = isLineLike ? (shape.startPoint!.y + shape.endPoint!.y) / 2 : shape.y + shape.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(shape.rotation);
    ctx.translate(-cx, -cy);
  }

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
  if (el.rotation) {
    const textLen = el.text ? el.text.length : 1;
    const w = Math.max(60, el.fontSize * textLen * 0.65);
    const h = el.fontSize * 1.5;
    const cx = el.x + w / 2;
    const cy = el.y + h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(el.rotation);
    ctx.translate(-cx, -cy);
  }
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
  if (model.rotation) {
    const cx = model.x + model.width / 2;
    const cy = model.y + model.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(model.rotation);
    ctx.translate(-cx, -cy);
  }
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

      const noteScale = Math.max(0.4, Math.min(2.0, Math.min(width / 200, height / 200)));

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
      const curlSize = Math.max(8, Math.min(22, Math.min(width, height) * 0.12));
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
      ctx.beginPath();
      ctx.moveTo(x + width - curlSize, y + height);
      ctx.lineTo(x + width, y + height - curlSize);
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      ctx.fill();

      // Top pushpin with highlight and shadow
      const pinY = y + Math.max(6, Math.min(14, 10 * noteScale));
      const pinR = Math.max(4, Math.min(13, 11 * noteScale));
      rc.circle(x + width / 2, pinY, pinR * 2, {
        fill: pinColor,
        fillStyle: 'solid',
        stroke: 'rgba(0, 0, 0, 0.3)',
        strokeWidth: 1.2,
      });
      // Specular pin highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(x + width / 2 - pinR * 0.2, pinY - pinR * 0.2, Math.max(1, pinR * 0.22), 0, Math.PI * 2);
      ctx.fill();

      // Tag Pill Badge
      const badgeH = Math.max(14, Math.min(24, 20 * noteScale));
      const badgeW = Math.max(40, Math.min(140 * noteScale, width - 28));
      const badgeY = pinY + pinR / 2 + Math.max(4, 6 * noteScale);
      ctx.fillStyle = tagBg;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x + (width - badgeW) / 2, badgeY, badgeW, badgeH, 6);
      } else {
        ctx.rect(x + (width - badgeW) / 2, badgeY, badgeW, badgeH);
      }
      ctx.fill();

      const badgeFontSize = Math.max(8, Math.min(13, Math.round(badgeH * 0.6)));
      ctx.fillStyle = tagTextColor;
      ctx.font = `bold ${badgeFontSize}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, x + width / 2, badgeY + badgeH / 2);

      // Memo Content text with multi-line paragraph wrapping, auto-scaling, and bottom boundary protection
      ctx.fillStyle = '#0f172a';
      const padSide = Math.max(8, Math.min(20, width * 0.08));
      const maxNoteWidth = Math.max(30, width - padSide * 2);
      const startTextY = badgeY + badgeH + Math.max(6, 10 * noteScale);
      const maxNoteHeight = Math.max(20, (y + height - curlSize - 4) - startTextY);

      let noteFontSize = Math.max(9, Math.min(24, Math.round(16 * noteScale)));
      let noteLines: string[] = [];
      let noteLineH = noteFontSize * 1.35;

      while (noteFontSize >= 9) {
        ctx.font = `${noteFontSize}px 'Kalam', 'Patrick Hand', cursive`;
        noteLines = wrapCanvasText(ctx, data.text || '', maxNoteWidth);
        noteLineH = noteFontSize * 1.35;
        if (noteLines.length * noteLineH <= maxNoteHeight || noteFontSize <= 9) {
          break;
        }
        noteFontSize -= 1;
      }

      ctx.font = `${noteFontSize}px 'Kalam', 'Patrick Hand', cursive`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      let curY = startTextY;
      const maxY = y + height - Math.max(8, curlSize);

      for (let i = 0; i < noteLines.length; i++) {
        if (curY + noteLineH > maxY) {
          ctx.fillText('...', x + padSide, curY);
          break;
        }
        ctx.fillText(noteLines[i], x + padSide, curY);
        curY += noteLineH;
      }
      break;
    }

    case 'matrix2x2': {
      // 2x2 Strategic Matrix
      const scale = Math.max(0.4, Math.min(2.5, Math.min(width / 520, height / 400)));
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
      rc.line(x + 10, midY, x + width - 10, midY, {
        stroke: color,
        strokeWidth: Math.max(1.5, 2.5 * scale),
        roughness: 1.2,
      });
      rc.line(midX, y + 10, midX, y + height - 10, {
        stroke: color,
        strokeWidth: Math.max(1.5, 2.5 * scale),
        roughness: 1.2,
      });

      // Quadrant labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const titleSize = Math.max(10, Math.min(24, Math.round(18 * scale)));
      const descSize = Math.max(8, Math.min(16, Math.round(14 * scale)));
      const axisSize = Math.max(8, Math.min(15, Math.round(13 * scale)));
      const topPad = Math.max(6, Math.min(24, height * 0.05));
      const descPad = topPad + titleSize + Math.max(2, 4 * scale);

      // Q1: Top-Left (High Impact, Low Effort -> QUICK WINS)
      ctx.fillStyle = '#16a34a';
      ctx.font = `bold ${titleSize}px 'Outfit', sans-serif`;
      ctx.fillText(data.q1?.title || 'QUICK WINS', x + width * 0.25, y + topPad);
      ctx.fillStyle = '#475569';
      ctx.font = `${descSize}px 'Patrick Hand', cursive`;
      ctx.fillText(data.q1?.desc || 'High Impact, Low Effort', x + width * 0.25, y + descPad);

      // Q2: Top-Right (High Impact, High Effort -> STRATEGIC BETS)
      ctx.fillStyle = '#2563eb';
      ctx.font = `bold ${titleSize}px 'Outfit', sans-serif`;
      ctx.fillText(data.q2?.title || 'STRATEGIC BETS', x + width * 0.75, y + topPad);
      ctx.fillStyle = '#475569';
      ctx.font = `${descSize}px 'Patrick Hand', cursive`;
      ctx.fillText(data.q2?.desc || 'Plan & Resource Well', x + width * 0.75, y + descPad);

      // Q3: Bottom-Left (Low Impact, Low Effort -> FILL-INS)
      ctx.fillStyle = '#d97706';
      ctx.font = `bold ${titleSize}px 'Outfit', sans-serif`;
      ctx.fillText(data.q3?.title || 'FILL-INS', x + width * 0.25, midY + topPad);
      ctx.fillStyle = '#475569';
      ctx.font = `${descSize}px 'Patrick Hand', cursive`;
      ctx.fillText(data.q3?.desc || 'Low Impact, Low Effort', x + width * 0.25, midY + descPad);

      // Q4: Bottom-Right (Low Impact, High Effort -> TIME SINKS)
      ctx.fillStyle = '#dc2626';
      ctx.font = `bold ${titleSize}px 'Outfit', sans-serif`;
      ctx.fillText(data.q4?.title || 'TIME SINKS', x + width * 0.75, midY + topPad);
      ctx.fillStyle = '#475569';
      ctx.font = `${descSize}px 'Patrick Hand', cursive`;
      ctx.fillText(data.q4?.desc || 'Deprioritize / Avoid', x + width * 0.75, midY + descPad);

      // Axis Titles
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${axisSize}px 'Outfit', sans-serif`;
      ctx.fillText(data.xAxis || 'EFFORT / COST →', x + width / 2, y + height - Math.max(12, 20 * scale));

      ctx.save();
      ctx.translate(x + Math.max(10, 16 * scale), midY);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(data.yAxis || 'VALUE / IMPACT →', 0, 0);
      ctx.restore();
      break;
    }

    case 'barchart': {
      // Native Hand-drawn Bar Chart
      const scale = Math.max(0.4, Math.min(2.5, Math.min(width / 480, height / 300)));
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      // Responsive Margins & Origin
      const marginLeft = Math.max(30, Math.min(70, width * 0.13));
      const marginRight = Math.max(16, Math.min(40, width * 0.06));
      const marginTop = Math.max(22, Math.min(50, height * 0.14));
      const marginBottom = Math.max(26, Math.min(60, height * 0.18));

      const originX = x + marginLeft;
      const originY = y + height - marginBottom;
      const chartW = Math.max(30, width - marginLeft - marginRight);
      const chartH = Math.max(25, height - marginTop - marginBottom);

      rc.line(originX, y + Math.max(12, marginTop * 0.6), originX, originY, {
        stroke: color,
        strokeWidth: Math.max(1.5, 2.5 * scale),
        roughness: 1.2,
      });
      rc.line(originX, originY, originX + chartW, originY, {
        stroke: color,
        strokeWidth: Math.max(1.5, 2.5 * scale),
        roughness: 1.2,
      });

      // Title / Y Label
      const titleFont = Math.max(9, Math.min(16, Math.round(13 * scale)));
      ctx.fillStyle = '#334155';
      ctx.font = `bold ${titleFont}px 'Outfit', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(data.yLabel || 'Growth / Impact', originX, y + Math.max(6, marginTop * 0.35));

      const bars: { label: string; value: number; color: string }[] = data.bars || [];
      const barSpacing = chartW / (bars.length || 1);
      const barWidth = Math.max(8, Math.min(55 * scale, barSpacing * 0.65));
      const valFontSize = Math.max(8, Math.min(16, Math.round(14 * scale)));
      const lblFontSize = Math.max(8, Math.min(14, Math.round(13 * scale)));

      bars.forEach((b, idx) => {
        const bx = originX + idx * barSpacing + (barSpacing - barWidth) / 2;
        const bHeight = Math.max(4, (b.value / 100) * chartH);
        const by = originY - bHeight;

        rc.rectangle(bx, by, barWidth, bHeight, {
          stroke: color,
          strokeWidth: Math.max(1.2, 2 * scale),
          fill: b.color || '#2563eb',
          fillStyle: 'hachure',
          hachureGap: Math.max(3, 5 * scale),
          roughness: 1.5,
        });

        // Value on top
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${valFontSize}px 'Patrick Hand', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${b.value}`, bx + barWidth / 2, Math.max(y + 4, by - 2));

        // Label below axis
        ctx.font = `${lblFontSize}px 'Patrick Hand', cursive`;
        ctx.fillStyle = '#475569';
        ctx.textBaseline = 'top';
        ctx.fillText(b.label, bx + barWidth / 2, originY + Math.max(4, 6 * scale));
      });
      break;
    }

    case 'piechart': {
      // Donut / Pie Chart
      const scale = Math.max(0.4, Math.min(2.5, Math.min(width / 380, height / 300)));
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const titleSize = Math.max(10, Math.min(20, Math.round(16 * scale)));
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold ${titleSize}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(data.title || 'Proportion Breakdown', x + width / 2, y + Math.max(8, 16 * scale));

      const topOffset = Math.max(22, titleSize + 16 * scale);
      const availH = height - topOffset;
      const cx = x + width * 0.36;
      const cy = y + topOffset + availH * 0.48;
      const radius = Math.max(15, Math.min(width * 0.28, availH * 0.4));

      // Sketchy outer ring
      rc.circle(cx, cy, radius * 2, {
        stroke: color,
        strokeWidth: Math.max(1.5, 2.2 * scale),
        roughness: 1.4,
      });

      // Draw Legend on right
      const slices = data.slices || [];
      const legX = x + width * 0.64;
      const itemH = Math.max(16, Math.min(36, (availH - 12) / (slices.length || 1)));
      let legY = y + topOffset + (availH - itemH * slices.length) / 2;
      const boxSize = Math.max(8, Math.min(18, Math.round(15 * scale)));
      const fontS = Math.max(8, Math.min(15, Math.round(13 * scale)));

      slices.forEach((s: any) => {
        rc.rectangle(legX, legY, boxSize, boxSize, {
          fill: s.color,
          fillStyle: 'solid',
          stroke: color,
          strokeWidth: 1.5,
          roughness: 1,
        });
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = `${fontS}px 'Patrick Hand', cursive`;
        ctx.fillStyle = '#1e293b';
        ctx.fillText(`${s.label} (${s.percent}%)`, legX + boxSize + Math.max(4, 8 * scale), legY + boxSize / 2);
        legY += itemH;
      });
      break;
    }

    case 'timeline': {
      // Milestone Timeline (When - Distinct Phased Steps)
      const scale = Math.max(0.4, Math.min(2.5, Math.min(width / 620, height / 240)));
      rc.rectangle(x, y, width, height, {
        stroke: '#cbd5e1',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const milestones = data.milestones || [];
      const lineY = y + height * 0.44;
      const padX = Math.max(20, Math.min(60, width * 0.08));
      const startX = x + padX;
      const endX = x + width - padX;

      // Connecting flow line
      rc.line(startX, lineY, endX, lineY, {
        stroke: '#94a3b8',
        strokeWidth: Math.max(1.8, 3 * scale),
        roughness: 1.2,
      });

      // End arrow
      const arrowSize = Math.max(6, 12 * scale);
      rc.line(endX, lineY, endX - arrowSize, lineY - arrowSize * 0.6, { stroke: '#64748b', strokeWidth: 2 });
      rc.line(endX, lineY, endX - arrowSize, lineY + arrowSize * 0.6, { stroke: '#64748b', strokeWidth: 2 });

      const spacing = (endX - startX - arrowSize) / (milestones.length || 1);

      const PHASE_PALETTES = [
        { stroke: '#4f46e5', fill: '#6366f1', glow: 'rgba(99, 102, 241, 0.16)', tagBg: '#eef2ff', tagText: '#4338ca', phase: 'Phase 1' },
        { stroke: '#0284c7', fill: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.16)', tagBg: '#e0f2fe', tagText: '#0369a1', phase: 'Phase 2' },
        { stroke: '#d97706', fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.16)', tagBg: '#fef3c7', tagText: '#b45309', phase: 'Phase 3' },
        { stroke: '#059669', fill: '#10b981', glow: 'rgba(16, 185, 129, 0.16)', tagBg: '#ecfdf5', tagText: '#047857', phase: 'Phase 4' },
        { stroke: '#7c3aed', fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.16)', tagBg: '#faf5ff', tagText: '#6d28d9', phase: 'Phase 5' },
      ];

      const nodeR = Math.max(10, Math.min(22, 17 * scale));
      const glowR = nodeR * 1.35;
      const badgeW = Math.max(36, Math.min(75, 62 * scale));
      const badgeH = Math.max(12, Math.min(20, 18 * scale));
      const badgeFont = Math.max(7, Math.min(11, Math.round(10 * scale)));
      const timeFont = Math.max(7, Math.min(13, Math.round(12 * scale)));
      const stepFont = Math.max(8, Math.min(16, Math.round(14 * scale)));
      const titleFont = Math.max(8, Math.min(17, Math.round(15 * scale)));
      const descFont = Math.max(7, Math.min(13, Math.round(12 * scale)));

      milestones.forEach((m: any, idx: number) => {
        const mx = startX + idx * spacing + spacing / 2;
        const pal = PHASE_PALETTES[idx % PHASE_PALETTES.length];

        // Soft glow ring
        rc.circle(mx, lineY, glowR * 2, {
          stroke: 'transparent',
          fill: pal.glow,
          fillStyle: 'solid',
        });

        // Milestone Node circle
        rc.circle(mx, lineY, nodeR * 2, {
          stroke: pal.stroke,
          strokeWidth: Math.max(1.5, 2.5 * scale),
          fill: pal.fill,
          fillStyle: 'solid',
          roughness: 1.3,
        });

        // Step number inside circle
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${stepFont}px 'Outfit', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${m.step || idx + 1}`, mx, lineY);

        // Phase pill badge above
        const phaseLabel = m.phase || pal.phase;
        const badgeY = lineY - nodeR - badgeH - Math.max(14, 22 * scale);
        ctx.fillStyle = pal.tagBg;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(mx - badgeW / 2, badgeY, badgeW, badgeH, 6);
        } else {
          ctx.rect(mx - badgeW / 2, badgeY, badgeW, badgeH);
        }
        ctx.fill();

        ctx.fillStyle = pal.tagText;
        ctx.font = `bold ${badgeFont}px 'Outfit', sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText(phaseLabel, mx, badgeY + badgeH / 2);

        // Date/Time pill
        const timeY = lineY - nodeR - Math.max(4, 8 * scale);
        ctx.fillStyle = '#475569';
        ctx.font = `bold ${timeFont}px 'Outfit', sans-serif`;
        ctx.textBaseline = 'bottom';
        ctx.fillText(m.time || '', mx, timeY);

        // Title & Desc below
        const titleY = lineY + nodeR + Math.max(4, 10 * scale);
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${titleFont}px 'Patrick Hand', cursive`;
        ctx.textBaseline = 'top';
        ctx.fillText(m.title || '', mx, titleY);

        const descY = titleY + titleFont + Math.max(2, 4 * scale);
        if (descY + descFont <= y + height - 4) {
          ctx.fillStyle = '#64748b';
          ctx.font = `${descFont}px 'Patrick Hand', cursive`;
          ctx.fillText(m.desc || '', mx, descY);
        }
      });
      break;
    }

    case 'flowchart': {
      // Step-by-step Flowchart (Distinct Steps & Badges)
      const scale = Math.max(0.4, Math.min(2.5, Math.min(width / 620, height / 280)));
      rc.rectangle(x, y, width, height, {
        stroke: '#cbd5e1',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const nodes = data.nodes || [];
      const totalPad = Math.max(16, Math.min(45, width * 0.06));
      const stepDist = (width - totalPad * 2) / (nodes.length || 1);
      const nodeH = Math.max(34, Math.min(85, height * 0.36));
      const nodeW = Math.max(40, Math.min(145, stepDist * 0.76));
      const centerY = y + height / 2;

      const STEP_PALETTES = [
        { stroke: '#059669', fill: '#ecfdf5', badgeBg: '#10b981', badgeText: '#ffffff', defaultBadge: 'STEP 1 • INPUT', text: '#064e3b' },
        { stroke: '#2563eb', fill: '#eff6ff', badgeBg: '#3b82f6', badgeText: '#ffffff', defaultBadge: 'STEP 2 • ACTION', text: '#1e3a8a' },
        { stroke: '#d97706', fill: '#fffbeb', badgeBg: '#f59e0b', badgeText: '#ffffff', defaultBadge: 'STEP 3 • CHECK', text: '#78350f' },
        { stroke: '#7c3aed', fill: '#f5f3ff', badgeBg: '#8b5cf6', badgeText: '#ffffff', defaultBadge: 'STEP 4 • GOAL', text: '#4c1d95' },
      ];

      const badgeFont = Math.max(7, Math.min(11, Math.round(9 * scale)));
      const labelFont = Math.max(8, Math.min(15, Math.round(13 * scale)));
      const badgeH = Math.max(12, Math.min(18, 16 * scale));
      const badgeW = Math.min(nodeW - 6, Math.max(30, 80 * scale));

      nodes.forEach((n: any, idx: number) => {
        const nx = x + totalPad + idx * stepDist + (stepDist - nodeW) / 2;
        const ny = centerY - nodeH / 2;
        const pal = STEP_PALETTES[idx % STEP_PALETTES.length];

        if (n.type === 'decision') {
          // Diamond shape
          const cx = nx + nodeW / 2;
          const cy = centerY;
          rc.polygon(
            [
              [cx, cy - nodeH / 2],
              [cx + nodeW / 2, cy],
              [cx, cy + nodeH / 2],
              [cx - nodeW / 2, cy],
            ],
            { stroke: '#d97706', strokeWidth: Math.max(1.5, 2.4 * scale), fill: '#fef3c7', fillStyle: 'solid', roughness: 1.3 }
          );

          // Decision Step Badge above diamond
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(cx - badgeW / 2, cy - nodeH / 2 - badgeH * 0.7, badgeW, badgeH, 6);
          } else {
            ctx.rect(cx - badgeW / 2, cy - nodeH / 2 - badgeH * 0.7, badgeW, badgeH);
          }
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${badgeFont}px 'Outfit', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`DECISION ?`, cx, cy - nodeH / 2 - badgeH * 0.2);

          // Decision text inside
          ctx.fillStyle = '#78350f';
          ctx.font = `bold ${labelFont}px 'Patrick Hand', cursive`;
          ctx.fillText(n.label, cx, cy);
        } else {
          // Process box
          const isStart = n.type === 'start' || idx === 0;
          const isEnd = n.type === 'end' || idx === nodes.length - 1;
          const strokeCol = isStart ? '#059669' : isEnd ? '#7c3aed' : pal.stroke;
          const fillCol = isStart ? '#ecfdf5' : isEnd ? '#f5f3ff' : pal.fill;
          const badgeBg = isStart ? '#10b981' : isEnd ? '#8b5cf6' : pal.badgeBg;
          const badgeText = isStart ? 'START • 1' : isEnd ? 'GOAL • DONE' : `STEP ${idx + 1}`;
          const textCol = isStart ? '#064e3b' : isEnd ? '#4c1d95' : pal.text;

          rc.rectangle(nx, ny, nodeW, nodeH, {
            stroke: strokeCol,
            strokeWidth: Math.max(1.5, 2.2 * scale),
            fill: fillCol,
            fillStyle: 'solid',
            roughness: 1.3,
          });

          // Step badge pill at top of box
          ctx.fillStyle = badgeBg;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(nx + (nodeW - badgeW) / 2, ny - badgeH / 2, badgeW, badgeH, 6);
          } else {
            ctx.rect(nx + (nodeW - badgeW) / 2, ny - badgeH / 2, badgeW, badgeH);
          }
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${badgeFont}px 'Outfit', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, nx + nodeW / 2, ny);

          // Node content label
          ctx.fillStyle = textCol;
          ctx.font = `bold ${labelFont}px 'Patrick Hand', cursive`;
          ctx.fillText(n.label, nx + nodeW / 2, centerY + Math.max(2, 4 * scale));
        }

        // Connecting arrow to next node
        if (idx < nodes.length - 1) {
          const nextNx = x + totalPad + (idx + 1) * stepDist + (stepDist - nodeW) / 2;
          const arrowStartX = nx + nodeW + 2;
          const arrowEndX = nextNx - 2;
          const arrowColor = pal.stroke;
          rc.line(arrowStartX, centerY, arrowEndX, centerY, { stroke: arrowColor, strokeWidth: Math.max(1.5, 2.2 * scale), roughness: 1.2 });
          const aSize = Math.max(5, 7 * scale);
          rc.line(arrowEndX, centerY, arrowEndX - aSize, centerY - aSize * 0.6, { stroke: arrowColor, strokeWidth: 2 });
          rc.line(arrowEndX, centerY, arrowEndX - aSize, centerY + aSize * 0.6, { stroke: arrowColor, strokeWidth: 2 });
        }
      });
      break;
    }

    case 'balance': {
      // Balance Scale (Trade-off)
      const scale = Math.max(0.4, Math.min(2.5, Math.min(width / 480, height / 320)));
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const cx = x + width / 2;
      const fulcrumH = Math.max(22, Math.min(65, height * 0.2));
      const fulcrumBaseY = y + height - Math.max(14, height * 0.1);
      const fulcrumTopY = fulcrumBaseY - fulcrumH;

      // Fulcrum Triangle
      rc.polygon(
        [
          [cx, fulcrumTopY],
          [cx + fulcrumH * 0.45, fulcrumBaseY],
          [cx - fulcrumH * 0.45, fulcrumBaseY],
        ],
        { stroke: color, strokeWidth: Math.max(1.8, 2.5 * scale), fill: '#cbd5e1', fillStyle: 'solid', roughness: 1.3 }
      );

      // Tilted beam
      const beamW = Math.max(50, width * 0.72);
      const angle = -0.06;
      const leftX = cx - (beamW / 2) * Math.cos(angle);
      const leftY = fulcrumTopY - (beamW / 2) * Math.sin(angle);
      const rightX = cx + (beamW / 2) * Math.cos(angle);
      const rightY = fulcrumTopY + (beamW / 2) * Math.sin(angle);

      rc.line(leftX, leftY, rightX, rightY, { stroke: color, strokeWidth: Math.max(2, 3.5 * scale), roughness: 1.2 });

      // Pan drop and widths
      const panDrop = Math.max(14, Math.min(50, height * 0.16));
      const panW = Math.max(24, Math.min(75, beamW * 0.16));
      const itemFont = Math.max(8, Math.min(16, Math.round(15 * scale)));
      const descFont = Math.max(7, Math.min(13, Math.round(13 * scale)));
      const verdictFont = Math.max(9, Math.min(16, Math.round(15 * scale)));

      // Left pan
      rc.line(leftX, leftY, leftX - panW * 0.25, leftY + panDrop, { stroke: '#94a3b8', strokeWidth: 1.5 });
      rc.line(leftX, leftY, leftX + panW * 0.25, leftY + panDrop, { stroke: '#94a3b8', strokeWidth: 1.5 });
      rc.line(leftX - panW / 2, leftY + panDrop, leftX + panW / 2, leftY + panDrop, { stroke: color, strokeWidth: 2.5 });

      // Right pan
      rc.line(rightX, rightY, rightX - panW * 0.25, rightY + panDrop, { stroke: '#94a3b8', strokeWidth: 1.5 });
      rc.line(rightX, rightY, rightX + panW * 0.25, rightY + panDrop, { stroke: '#94a3b8', strokeWidth: 1.5 });
      rc.line(rightX - panW / 2, rightY + panDrop, rightX + panW / 2, rightY + panDrop, { stroke: color, strokeWidth: 2.5 });

      // Left item text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = `bold ${itemFont}px 'Outfit', sans-serif`;
      ctx.fillStyle = '#dc2626';
      ctx.fillText(data.leftItem || 'Cost & Effort', leftX, leftY + panDrop + Math.max(6, 12 * scale));
      ctx.font = `${descFont}px 'Patrick Hand', cursive`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(data.leftWeight || 'Current Burden', leftX, leftY + panDrop + Math.max(6, 12 * scale) + itemFont + 2);

      // Right item text
      ctx.font = `bold ${itemFont}px 'Outfit', sans-serif`;
      ctx.fillStyle = '#16a34a';
      ctx.fillText(data.rightItem || 'Future Growth', rightX, rightY + panDrop + Math.max(6, 12 * scale));
      ctx.font = `${descFont}px 'Patrick Hand', cursive`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(data.rightWeight || '10x Upside', rightX, rightY + panDrop + Math.max(6, 12 * scale) + itemFont + 2);

      // Verdict badge
      ctx.font = `bold ${verdictFont}px 'Patrick Hand', cursive`;
      ctx.fillStyle = '#0f172a';
      ctx.fillText(data.verdict || 'Decision: Worth it!', cx, y + Math.max(10, height * 0.08));
      break;
    }

    case 'venn': {
      // 2-Circle Venn Diagram
      const scale = Math.max(0.4, Math.min(2.5, Math.min(width / 460, height / 320)));
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const radius = Math.max(20, Math.min(width * 0.28, height * 0.36));
      const cy = y + height / 2;
      const cOffset = radius * 0.58;
      const c1X = x + width / 2 - cOffset;
      const c2X = x + width / 2 + cOffset;

      // Circle 1
      rc.circle(c1X, cy, radius * 2, {
        stroke: '#2563eb',
        strokeWidth: Math.max(1.8, 2.5 * scale),
        fill: 'rgba(59, 130, 246, 0.1)',
        fillStyle: 'solid',
        roughness: 1.4,
      });

      // Circle 2
      rc.circle(c2X, cy, radius * 2, {
        stroke: '#059669',
        strokeWidth: Math.max(1.8, 2.5 * scale),
        fill: 'rgba(16, 185, 129, 0.1)',
        fillStyle: 'solid',
        roughness: 1.4,
      });

      // Labels
      const lblFont = Math.max(8, Math.min(17, Math.round(15 * scale)));
      const sweetFont = Math.max(7, Math.min(14, Math.round(13 * scale)));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${lblFont}px 'Outfit', sans-serif`;
      ctx.fillStyle = '#1d4ed8';
      ctx.fillText(data.leftLabel || 'What Users Love', c1X - radius * 0.32, cy - Math.max(4, 8 * scale));

      ctx.fillStyle = '#047857';
      ctx.fillText(data.rightLabel || 'What Is Feasible', c2X + radius * 0.32, cy - Math.max(4, 8 * scale));

      // Sweet Spot in intersection
      ctx.fillStyle = '#b45309';
      ctx.font = `bold ${sweetFont}px 'Patrick Hand', cursive`;
      ctx.fillText(data.sweetSpot || 'SWEET SPOT', x + width / 2, cy);
      break;
    }

    case 'scurve': {
      // S-Curve Growth lifecycle
      const scale = Math.max(0.4, Math.min(2.5, Math.min(width / 500, height / 280)));
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const padLeft = Math.max(24, Math.min(60, width * 0.1));
      const padRight = Math.max(16, Math.min(45, width * 0.08));
      const padBottom = Math.max(22, Math.min(55, height * 0.18));
      const padTop = Math.max(22, Math.min(50, height * 0.18));

      const startX = x + padLeft;
      const endX = x + width - padRight;
      const baseY = y + height - padBottom;
      const topY = y + padTop;

      // Axes
      rc.line(startX, topY, startX, baseY, { stroke: color, strokeWidth: Math.max(1.5, 2 * scale) });
      rc.line(startX, baseY, endX, baseY, { stroke: color, strokeWidth: Math.max(1.5, 2 * scale) });

      // Sigmoid S-Curve path
      const curvePts: [number, number][] = [];
      const totalSteps = 40;
      for (let i = 0; i <= totalSteps; i++) {
        const t = (i / totalSteps) * 6 - 3;
        const sig = 1 / (1 + Math.exp(-t));
        const px = startX + (i / totalSteps) * (endX - startX);
        const py = baseY - sig * (baseY - topY);
        curvePts.push([px, py]);
      }

      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = Math.max(2, 3.5 * scale);
      ctx.beginPath();
      ctx.moveTo(curvePts[0][0], curvePts[0][1]);
      for (let i = 1; i < curvePts.length; i++) {
        ctx.lineTo(curvePts[i][0], curvePts[i][1]);
      }
      ctx.stroke();
      ctx.restore();

      // Phases
      const phaseFont = Math.max(8, Math.min(15, Math.round(13 * scale)));
      const calloutFont = Math.max(8, Math.min(15, Math.round(13 * scale)));
      ctx.fillStyle = '#475569';
      ctx.font = `${phaseFont}px 'Patrick Hand', cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const phases = data.phases || ['1. Inception', '2. Growth', '3. Scale'];
      ctx.fillText(phases[0], startX + (endX - startX) * 0.15, baseY + Math.max(4, 8 * scale));
      ctx.fillText(phases[1], startX + (endX - startX) * 0.5, baseY + Math.max(4, 8 * scale));
      ctx.fillText(phases[2], startX + (endX - startX) * 0.85, baseY + Math.max(4, 8 * scale));

      // Inflection callout
      ctx.fillStyle = '#dc2626';
      ctx.font = `bold ${calloutFont}px 'Outfit', sans-serif`;
      ctx.textBaseline = 'bottom';
      ctx.fillText(data.inflectionPoint || 'Inflection Point', startX + (endX - startX) * 0.5, topY + Math.max(16, 28 * scale));
      break;
    }

    case 'stickmanScene': {
      // Stakeholder Trio / Character Scene
      rc.rectangle(x, y, width, height, {
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        fill: '#ffffff',
        fillStyle: 'solid',
        roughness: 1.2,
      });

      const chars = data.characters || [];
      const cardW = (width - 40) / (chars.length || 1);
      const charScale = Math.max(0.45, Math.min(2.0, Math.min(cardW / 140, height / 270)));

      chars.forEach((c: any, i: number) => {
        const cx = x + 20 + i * cardW + cardW / 2;

        const headY = y + Math.max(18, height * 0.22);
        const headR = Math.max(10, Math.min(26, 18 * charScale));
        const bodyLen = Math.max(18, Math.min(65, 52 * charScale));
        const bodyTop = headY + headR;
        const pelvisY = bodyTop + bodyLen;
        const armY = bodyTop + bodyLen * 0.35;
        const armSpan = Math.max(12, Math.min(36, 24 * charScale));
        const legLen = Math.max(16, Math.min(55, 45 * charScale));
        const legSpread = Math.max(10, Math.min(30, 20 * charScale));

        // Stickman head & body
        rc.circle(cx, headY, headR * 2, { stroke: color, strokeWidth: Math.max(1.5, 2 * charScale), roughness: 1.4 });
        rc.line(cx, bodyTop, cx, pelvisY, { stroke: color, strokeWidth: Math.max(1.6, 2.2 * charScale) });
        // Arms
        rc.line(cx - armSpan, armY, cx + armSpan, armY, { stroke: color, strokeWidth: Math.max(1.5, 2 * charScale) });
        // Legs
        rc.line(cx, pelvisY, cx - legSpread, pelvisY + legLen, { stroke: color, strokeWidth: Math.max(1.5, 2 * charScale) });
        rc.line(cx, pelvisY, cx + legSpread, pelvisY + legLen, { stroke: color, strokeWidth: Math.max(1.5, 2 * charScale) });

        // Emoji badge inside/above head
        const emojiSize = Math.max(12, Math.min(30, Math.round(22 * charScale)));
        ctx.font = `${emojiSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.emoji || '🧑‍💻', cx, headY);

        // Role title
        const roleFont = Math.max(8, Math.min(18, Math.round(15 * charScale)));
        ctx.font = `bold ${roleFont}px 'Outfit', sans-serif`;
        ctx.fillStyle = '#0f172a';
        ctx.textBaseline = 'top';
        const roleY = pelvisY + legLen + Math.max(6, 12 * charScale);
        ctx.fillText(c.role || '', cx, roleY);

        // Note
        const noteFont = Math.max(7, Math.min(14, Math.round(13 * charScale)));
        const noteY = roleY + roleFont + Math.max(2, 4 * charScale);
        if (noteY + noteFont <= y + height - 4) {
          ctx.font = `${noteFont}px 'Patrick Hand', cursive`;
          ctx.fillStyle = '#64748b';
          ctx.fillText(c.note || '', cx, noteY);
        }
      });
      break;
    }

    default: {
      // Graceful fallback for any generic or cognitive model card
      rc.rectangle(x, y, width, height, {
        stroke: color || '#94a3b8',
        strokeWidth: 2,
        fill: fillColor || '#ffffff',
        fillStyle: 'solid',
        roughness: 1.3,
      });

      const mScale = Math.max(0.4, Math.min(2.0, Math.min(width / 400, height / 250)));
      const tFont = Math.max(10, Math.min(20, Math.round(16 * mScale)));
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${tFont}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(model.title || model.modelKind, x + width / 2, y + Math.max(8, 14 * mScale));

      if (data?.text || data?.desc || data?.summary) {
        const bodyTxt = data.text || data.desc || data.summary;
        const bFont = Math.max(8, Math.min(15, Math.round(13 * mScale)));
        ctx.font = `${bFont}px 'Patrick Hand', cursive`;
        ctx.fillStyle = '#475569';
        const lines = wrapCanvasText(ctx, bodyTxt, width - 24);
        let cy = y + Math.max(16, 20 * mScale) + tFont;
        for (const line of lines) {
          if (cy + bFont * 1.3 > y + height - 8) break;
          ctx.fillText(line, x + width / 2, cy);
          cy += bFont * 1.3;
        }
      }
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
  if (stamp.rotation) {
    const cx = stamp.x + stamp.size / 2;
    const cy = stamp.y + stamp.size / 2;
    ctx.translate(cx, cy);
    ctx.rotate(stamp.rotation);
    ctx.translate(-cx, -cy);
  }
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
