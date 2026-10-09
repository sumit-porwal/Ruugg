import rough from 'roughjs';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';
import type { ProjectState, Slide } from '../types';
import {
  renderBackground,
  renderConnector,
  renderModel,
  renderShape,
  renderStamp,
  renderStroke,
  renderText,
} from './canvasRenderer';
import { downloadFile } from './fileStorage';

export interface RenderSlideOptions {
  width?: number;
  height?: number;
  scale?: number;
  transparentBg?: boolean;
  autoFrame?: boolean;
  padding?: number;
}

export interface ExportProgress {
  current: number;
  total: number;
  phase: string;
}

/**
 * Calculates the bounding box of all elements on a slide
 */
export function getSlideBoundingBox(slide: Slide): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (!slide.elements || slide.elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 1600, maxY: 900, width: 1600, height: 900 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of slide.elements) {
    if (el.type === 'shape' || el.type === 'model') {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + (el.width || 120));
      maxY = Math.max(maxY, el.y + (el.height || 80));
    } else if (el.type === 'stamp') {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + (el.size || 64));
      maxY = Math.max(maxY, el.y + (el.size || 64) + (el.label ? 24 : 0));
    } else if (el.type === 'text') {
      const approxW = Math.max(60, (el.fontSize || 20) * (el.text ? el.text.length : 1) * 0.65);
      const approxH = (el.fontSize || 20) * 1.5;
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + approxW);
      maxY = Math.max(maxY, el.y + approxH);
    } else if (el.type === 'stroke') {
      for (const p of el.points) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
    } else if (el.type === 'connector') {
      minX = Math.min(minX, el.fromPoint.x, el.toPoint.x);
      minY = Math.min(minY, el.fromPoint.y, el.toPoint.y);
      maxX = Math.max(maxX, el.fromPoint.x, el.toPoint.x);
      maxY = Math.max(maxY, el.fromPoint.y, el.toPoint.y);
    }
  }

  if (minX === Infinity) {
    return { minX: 0, minY: 0, maxX: 1600, maxY: 900, width: 1600, height: 900 };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(100, maxX - minX),
    height: Math.max(100, maxY - minY),
  };
}

/**
 * Renders any slide onto an offscreen canvas at high resolution
 */
export function renderSlideToCanvas(
  slide: Slide,
  options?: RenderSlideOptions
): HTMLCanvasElement {
  const baseWidth = options?.width || 1920;
  const baseHeight = options?.height || 1080;
  const scale = options?.scale || 1;
  const transparentBg = !!options?.transparentBg;
  const autoFrame = options?.autoFrame ?? true;
  const padding = options?.padding ?? 60;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(baseWidth * scale);
  canvas.height = Math.round(baseHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Apply scale
  ctx.save();
  ctx.scale(scale, scale);

  // Background
  if (!transparentBg) {
    renderBackground(ctx, baseWidth, baseHeight, slide.paperTexture);
  } else {
    ctx.clearRect(0, 0, baseWidth, baseHeight);
  }

  // Auto-framing transform
  ctx.save();

  if (autoFrame && slide.elements.length > 0) {
    const bbox = getSlideBoundingBox(slide);
    // If elements are placed outside standard bounds or we want to center them nicely
    const availableWidth = baseWidth - padding * 2;
    const availableHeight = baseHeight - padding * 2;

    // Check if content naturally fits without scaling down
    const fitsNaturally =
      bbox.minX >= padding &&
      bbox.maxX <= baseWidth - padding &&
      bbox.minY >= padding &&
      bbox.maxY <= baseHeight - padding;

    if (!fitsNaturally) {
      const scaleX = availableWidth / bbox.width;
      const scaleY = availableHeight / bbox.height;
      const fitScale = Math.min(1, Math.min(scaleX, scaleY));

      const scaledW = bbox.width * fitScale;
      const scaledH = bbox.height * fitScale;

      const offsetX = padding + (availableWidth - scaledW) / 2 - bbox.minX * fitScale;
      const offsetY = padding + (availableHeight - scaledH) / 2 - bbox.minY * fitScale;

      ctx.translate(offsetX, offsetY);
      ctx.scale(fitScale, fitScale);
    }
  }

  const rc = rough.canvas(canvas);

  // Render elements in order
  for (const el of slide.elements) {
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

  ctx.restore(); // autoFrame transform
  ctx.restore(); // scale transform

  return canvas;
}

/**
 * Render slide to PNG Data URL
 */
export function renderSlideToDataUrl(
  slide: Slide,
  options?: RenderSlideOptions
): string {
  const canvas = renderSlideToCanvas(slide, options);
  return canvas.toDataURL('image/png');
}

/**
 * Render slide to Blob
 */
export async function renderSlideToBlob(
  slide: Slide,
  options?: RenderSlideOptions
): Promise<Blob> {
  const canvas = renderSlideToCanvas(slide, options);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate canvas blob'));
    }, 'image/png');
  });
}

/**
 * Export current slide as PNG image
 */
export function exportSlideToPng(
  slide: Slide,
  options?: {
    scale?: number;
    transparentBg?: boolean;
    fileName?: string;
  }
): void {
  const scale = options?.scale || 1.5; // default 1.5x for crisp visual
  const canvas = renderSlideToCanvas(slide, {
    scale,
    transparentBg: options?.transparentBg,
  });

  canvas.toBlob((blob) => {
    if (!blob) return;
    const safeTitle = (slide.title || 'napkin_slide').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = options?.fileName || `${safeTitle}.png`;
    downloadFile(blob, fileName, 'image/png');
  }, 'image/png');
}

/**
 * Export slide as vector SVG
 */
export function exportSlideToSvg(slide: Slide): void {
  // Render high-res snapshot and wrap in clean SVG container with embedded vector metadata
  const canvas = renderSlideToCanvas(slide, { scale: 2 });
  const dataUrl = canvas.toDataURL('image/png');
  const safeTitle = (slide.title || 'napkin_slide').replace(/[^a-zA-Z0-9_-]/g, '_');

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1920 1080" width="100%" height="100%">
  <title>${escapeXml(slide.title)}</title>
  <desc>${escapeXml(slide.questionPrompt || slide.notes || 'NapkinCanvas visual thinking diagram')}</desc>
  <image width="1920" height="1080" xlink:href="${dataUrl}"/>
</svg>`;

  downloadFile(svgContent, `${safeTitle}.svg`, 'image/svg+xml');
}

function escapeXml(unsafe?: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Export slide or entire deck to PDF
 */
export async function exportToPdf(
  project: ProjectState,
  options: {
    scope: 'current' | 'all';
    activeSlideId: string;
    quality?: 'standard' | 'hd';
    includeNotes?: boolean;
    onProgress?: (progress: ExportProgress) => void;
  }
): Promise<void> {
  const targetSlides =
    options.scope === 'current'
      ? project.slides.filter((s) => s.id === options.activeSlideId)
      : project.slides;

  if (targetSlides.length === 0) return;

  const total = targetSlides.length;
  const scale = options.quality === 'hd' ? 2 : 1.25;

  // 16:9 presentation dimensions in points (1920 x 1080 pt)
  const pdfWidth = 1920;
  const pdfHeight = 1080;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [pdfWidth, pdfHeight],
    compress: true,
  });

  for (let i = 0; i < total; i++) {
    const slide = targetSlides[i];
    options.onProgress?.({
      current: i + 1,
      total,
      phase: `Rendering slide ${i + 1} of ${total}: ${slide.title}...`,
    });

    if (i > 0) {
      pdf.addPage([pdfWidth, pdfHeight], 'landscape');
    }

    // Render slide image
    const dataUrl = renderSlideToDataUrl(slide, {
      width: pdfWidth,
      height: pdfHeight,
      scale,
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // Optional speaker notes page or overlay if enabled
    if (options.includeNotes && slide.notes?.trim()) {
      pdf.addPage([pdfWidth, pdfHeight], 'landscape');
      // Background for notes
      pdf.setFillColor(254, 252, 246);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

      // Notes header
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(36);
      pdf.text(`Speaker Notes — ${slide.title}`, 80, 100);

      if (slide.questionPrompt) {
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(22);
        pdf.text(`Core Question: "${slide.questionPrompt}"`, 80, 150);
      }

      // Divider line
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(2);
      pdf.line(80, 180, pdfWidth - 80, 180);

      // Notes content
      pdf.setTextColor(51, 65, 85);
      pdf.setFontSize(24);
      const splitNotes = pdf.splitTextToSize(slide.notes, pdfWidth - 160);
      pdf.text(splitNotes, 80, 230);
    }

    // Yield control to UI thread to allow animation / progress updates
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  options.onProgress?.({
    current: total,
    total,
    phase: 'Finalizing PDF document...',
  });

  const safeTitle = (project.title || 'napkin_presentation').replace(/[^a-zA-Z0-9_-]/g, '_');
  const scopeSuffix = options.scope === 'current' ? '_slide' : '_deck';
  pdf.save(`${safeTitle}${scopeSuffix}.pdf`);
}

/**
 * Export slide or entire deck to PowerPoint (.pptx)
 */
export async function exportToPptx(
  project: ProjectState,
  options: {
    scope: 'current' | 'all';
    activeSlideId: string;
    onProgress?: (progress: ExportProgress) => void;
  }
): Promise<void> {
  const targetSlides =
    options.scope === 'current'
      ? project.slides.filter((s) => s.id === options.activeSlideId)
      : project.slides;

  if (targetSlides.length === 0) return;

  const total = targetSlides.length;

  const PptxConstructor = (pptxgen as any).default || pptxgen;
  const pptx = new PptxConstructor();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = project.title || 'NapkinCanvas Presentation';
  pptx.subject = 'Visual Thinking & Napkin Sketches';
  pptx.company = 'NapkinCanvas';

  for (let i = 0; i < total; i++) {
    const slide = targetSlides[i];
    options.onProgress?.({
      current: i + 1,
      total,
      phase: `Preparing slide ${i + 1} of ${total}: ${slide.title}...`,
    });

    const pptxSlide = pptx.addSlide();

    // Render slide as crisp 1920x1080 image
    const dataUrl = renderSlideToDataUrl(slide, {
      width: 1920,
      height: 1080,
      scale: 1.5,
    });

    pptxSlide.addImage({
      data: dataUrl,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
    });

    // Add speaker notes to PowerPoint presenter view!
    const notesText = [
      slide.questionPrompt ? `Question: ${slide.questionPrompt}` : '',
      slide.notes ? `Notes:\n${slide.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    if (notesText) {
      pptxSlide.addNotes(notesText);
    }

    // Yield to UI thread
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  options.onProgress?.({
    current: total,
    total,
    phase: 'Generating PowerPoint file...',
  });

  const safeTitle = (project.title || 'napkin_deck').replace(/[^a-zA-Z0-9_-]/g, '_');
  const scopeSuffix = options.scope === 'current' ? '_slide' : '';
  await pptx.writeFile({ fileName: `${safeTitle}${scopeSuffix}.pptx` });
}

/**
 * Export all slides as a ZIP archive of high-res PNGs and project file
 */
export async function exportDeckToZip(
  project: ProjectState,
  options?: {
    scale?: number;
    onProgress?: (progress: ExportProgress) => void;
  }
): Promise<void> {
  const zip = new JSZip();
  const total = project.slides.length;
  const scale = options?.scale || 1.5;

  const slidesFolder = zip.folder('slides');

  for (let i = 0; i < total; i++) {
    const slide = project.slides[i];
    options?.onProgress?.({
      current: i + 1,
      total,
      phase: `Rendering slide ${i + 1} of ${total}: ${slide.title}...`,
    });

    const blob = await renderSlideToBlob(slide, { scale });
    const paddedIndex = String(i + 1).padStart(2, '0');
    const safeSlideTitle = (slide.title || `slide_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    slidesFolder?.file(`${paddedIndex}_${safeSlideTitle}.png`, blob);

    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  // Include project file inside ZIP
  zip.file(
    `${(project.title || 'project').replace(/[^a-zA-Z0-9_-]/g, '_')}.napkin`,
    JSON.stringify(
      {
        app: 'NapkinCanvas',
        version: '1.0',
        savedAt: new Date().toISOString(),
        project,
      },
      null,
      2
    )
  );

  // Include visual outline Markdown
  zip.file('visual_outline.md', generateProjectMarkdown(project));

  options?.onProgress?.({
    current: total,
    total,
    phase: 'Compressing ZIP archive...',
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const safeTitle = (project.title || 'napkin_deck').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadFile(zipBlob, `${safeTitle}_slides.zip`, 'application/zip');
}

/**
 * Generate clean Markdown outline for presentation/notes
 */
export function generateProjectMarkdown(project: ProjectState): string {
  let md = `# ${project.title}\n\n`;
  md += `*Exported from NapkinCanvas on ${new Date().toLocaleDateString()}*\n\n`;
  md += `**Total Napkin Slides:** ${project.slides.length}\n\n---\n\n`;

  project.slides.forEach((slide, idx) => {
    md += `## ${idx + 1}. ${slide.title}\n\n`;
    if (slide.sliceTag) {
      md += `**6-Slices Form:** \`${slide.sliceTag}\`\n\n`;
    }
    if (slide.frameworkId) {
      md += `**Framework:** \`${slide.frameworkId}\`\n\n`;
    }
    if (slide.questionPrompt) {
      md += `> **Core Question:** ${slide.questionPrompt}\n\n`;
    }
    if (slide.notes) {
      md += `### Speaker Notes & Insights\n\n${slide.notes}\n\n`;
    }

    // Element breakdown
    const elementsByType = slide.elements.reduce((acc, el) => {
      acc[el.type] = (acc[el.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    md += `**Visual Elements:** ${slide.elements.length} (${Object.entries(elementsByType)
      .map(([k, v]) => `${v} ${k}`)
      .join(', ')})\n\n`;

    // Semantic tags
    const tagged = slide.elements.filter((e) => e.tag);
    if (tagged.length > 0) {
      md += `### Semantic Thinking Items\n\n`;
      tagged.forEach((t) => {
        const text = 'text' in t && t.text ? t.text : 'title' in t && (t as any).title ? (t as any).title : t.type;
        md += `- **[${(t.tag || '').toUpperCase()}]** ${text}\n`;
      });
      md += '\n';
    }

    md += `---\n\n`;
  });

  return md;
}

/**
 * Export speaker notes as Markdown file
 */
export function exportNotesToMarkdown(project: ProjectState): void {
  const md = generateProjectMarkdown(project);
  const safeTitle = (project.title || 'napkin_notes').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadFile(md, `${safeTitle}_outline.md`, 'text/markdown');
}
