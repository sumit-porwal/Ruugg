import type { ProjectState, Slide } from '../types';
import { getInitialProject } from './initialProject';

export interface NapkinFileEnvelope {
  app: 'NapkinCanvas';
  version: string;
  savedAt: string;
  project: ProjectState;
}

const LOCAL_STORAGE_KEY = 'napkin_canvas_project';
const LAST_SAVED_KEY = 'napkin_canvas_last_saved';

/**
 * Save project to browser localStorage
 */
export function saveToLocalStorage(project: ProjectState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
    localStorage.setItem(LAST_SAVED_KEY, new Date().toISOString());
  } catch (err) {
    console.warn('LocalStorage save failed (quota exceeded or private mode):', err);
  }
}

/**
 * Load project from browser localStorage
 */
export function loadFromLocalStorage(): ProjectState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidProject(parsed)) {
        return normalizeProject(parsed);
      }
    }
  } catch (err) {
    console.error('Failed to load project from localStorage:', err);
  }
  return getInitialProject();
}

/**
 * Get timestamp of last local save
 */
export function getLastSavedTime(): string | null {
  try {
    return localStorage.getItem(LAST_SAVED_KEY);
  } catch {
    return null;
  }
}

/**
 * Validates that an object has the minimum structure of a Napkin project
 */
export function isValidProject(data: any): data is ProjectState {
  if (!data || typeof data !== 'object') return false;
  // Wrapped envelope format
  if (data.app === 'NapkinCanvas' && data.project && Array.isArray(data.project.slides)) {
    return true;
  }
  // Direct project format
  if (Array.isArray(data.slides) && data.slides.length > 0) {
    return true;
  }
  return false;
}

/**
 * Normalizes loaded data into a safe, valid ProjectState
 */
export function normalizeProject(data: any): ProjectState {
  const rawProject = data.app === 'NapkinCanvas' && data.project ? data.project : data;
  
  const title = typeof rawProject.title === 'string' && rawProject.title.trim()
    ? rawProject.title.trim()
    : 'Untitled Napkin Deck';

  const slides: Slide[] = Array.isArray(rawProject.slides)
    ? rawProject.slides.map((s: any, idx: number) => ({
        id: s.id || `slide_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        title: s.title || `Napkin Slide ${idx + 1}`,
        sliceTag: s.sliceTag,
        frameworkId: s.frameworkId,
        questionPrompt: s.questionPrompt || '',
        notes: s.notes || '',
        paperTexture: s.paperTexture || 'napkin',
        elements: Array.isArray(s.elements) ? s.elements : [],
        guidedData: s.guidedData,
      }))
    : [];

  if (slides.length === 0) {
    return getInitialProject();
  }

  const activeSlideId =
    slides.some((s) => s.id === rawProject.activeSlideId)
      ? rawProject.activeSlideId
      : slides[0].id;

  return {
    title,
    slides,
    activeSlideId,
    lastGoalPrompt: rawProject.lastGoalPrompt,
  };
}

/**
 * Trigger browser download for a blob or text content
 */
export function downloadFile(content: Blob | string, fileName: string, mimeType = 'application/json'): void {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export project as a downloadable .napkin file
 */
export function exportNapkinFile(project: ProjectState, format: 'napkin' | 'json' = 'napkin'): void {
  const envelope: NapkinFileEnvelope = {
    app: 'NapkinCanvas',
    version: '1.0',
    savedAt: new Date().toISOString(),
    project,
  };

  const jsonStr = JSON.stringify(envelope, null, 2);
  const safeTitle = (project.title || 'napkin_deck').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeTitle}.${format}`;
  downloadFile(jsonStr, fileName, 'application/json');
}

/**
 * Modern Save to File using File System Access API if available, falling back to download
 */
export async function saveProjectWithPicker(
  project: ProjectState,
  existingHandle?: any
): Promise<{ success: boolean; handle?: any; fileName: string }> {
  const envelope: NapkinFileEnvelope = {
    app: 'NapkinCanvas',
    version: '1.0',
    savedAt: new Date().toISOString(),
    project,
  };
  const jsonStr = JSON.stringify(envelope, null, 2);
  const safeTitle = (project.title || 'napkin_deck').replace(/[^a-zA-Z0-9_-]/g, '_');

  // Check if File System Access API is supported and if user can pick / write
  if ('showSaveFilePicker' in window && window.self === window.top) {
    try {
      let handle = existingHandle;
      if (!handle) {
        handle = await (window as any).showSaveFilePicker({
          suggestedName: `${safeTitle}.napkin`,
          types: [
            {
              description: 'Napkin Visual Thinking Deck (*.napkin)',
              accept: { 'application/json': ['.napkin'] },
            },
            {
              description: 'JSON Project (*.json)',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
      }

      const writable = await handle.createWritable();
      await writable.write(jsonStr);
      await writable.close();

      const fileInfo = await handle.getFile();
      return { success: true, handle, fileName: fileInfo.name };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled picker
        return { success: false, fileName: '' };
      }
      console.warn('File System Access API failed, falling back to download:', err);
    }
  }

  // Fallback: standard file download
  const fileName = `${safeTitle}.napkin`;
  downloadFile(jsonStr, fileName, 'application/json');
  return { success: true, fileName };
}

/**
 * Open project from file with File System Access API or input dialog fallback
 */
export async function openProjectFromFilePicker(): Promise<{
  project: ProjectState;
  fileName: string;
  handle?: any;
} | null> {
  if ('showOpenFilePicker' in window && window.self === window.top) {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'Napkin Files (*.napkin, *.json)',
            accept: {
              'application/json': ['.napkin', '.json'],
            },
          },
        ],
        multiple: false,
      });

      const file = await handle.getFile();
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (isValidProject(parsed)) {
        return {
          project: normalizeProject(parsed),
          fileName: file.name,
          handle,
        };
      } else {
        throw new Error('File is not a valid NapkinCanvas project.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return null;
      console.warn('File picker open failed, falling back to traditional input:', err);
    }
  }

  // Traditional file input fallback
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.napkin,.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (isValidProject(parsed)) {
          resolve({
            project: normalizeProject(parsed),
            fileName: file.name,
          });
        } else {
          reject(new Error('Invalid Napkin file format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    input.click();
  });
}

/**
 * Parse an imported File object (e.g. from Drag & Drop or input[type=file])
 */
export async function parseProjectFile(file: File): Promise<ProjectState> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!isValidProject(parsed)) {
    throw new Error('The selected file does not appear to be a valid NapkinCanvas project.');
  }
  return normalizeProject(parsed);
}
