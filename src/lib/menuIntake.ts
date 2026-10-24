/**
 * Real menu intake — OCR + PDF text extraction in the browser.
 *
 * Replaces the previous behaviour, which substituted a hardcoded sample menu
 * no matter which file was uploaded. Now:
 *   - PDFs: every page is read. Text-layer PDFs come back instantly via
 *     pdfjs; scanned/image-only PDFs are rendered to a canvas and OCR'd.
 *   - Images: single or multiple photos are OCR'd (multi-page menus = several
 *     photos). Each source keeps its own extracted text so the user can review
 *     and edit before anything becomes the live menu.
 *
 * No API key and no server cost — tesseract.js runs WASM locally, and the
 * engine, worker and language data are all served from this app's own /ocr
 * directory, so it works with no network access at all.
 */
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import corePath from 'tesseract.js-core/tesseract-core-simd-lstm.wasm?url';
import workerPath from 'tesseract.js/dist/worker.min.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const LOCAL_CORE_PATH = corePath;
const LOCAL_WORKER_PATH = workerPath;
const LOCAL_LANG_BASE = `${import.meta.env.BASE_URL}ocr`;

export type MenuSourceKind = 'image' | 'pdf';

export interface MenuSource {
  /** Stable id for this source (React key + edit target). */
  id: string;
  kind: MenuSourceKind;
  /** Original file name, for display. */
  fileName: string;
  /** Object URL for images (PDFs have no preview). */
  previewUrl: string | null;
  /** Extracted text, per source, ready to edit. */
  rawText: string;
  /** Number of pages (PDF only; images are 1). */
  pageCount: number;
  /** Extraction progress 0..1 while working. */
  progress: number;
  status: 'pending' | 'extracting' | 'done' | 'error';
  error?: string;
}

export const OCR_LANGUAGES = [
  { id: 'spa', label: 'Español' },
  { id: 'eng', label: 'English' },
  { id: 'spa+eng', label: 'Español + English' },
  { id: 'por', label: 'Português' },
] as const;

export type OcrLanguage = (typeof OCR_LANGUAGES)[number]['id'];

/** Map an OCR language id to the bundled .traineddata files it needs. */
function langFiles(language: OcrLanguage): string[] {
  const base = `${LOCAL_LANG_BASE}/`;
  switch (language) {
    case 'spa':
      return [`${base}/spa.traineddata.gz`];
    case 'eng':
      return [`${base}/eng.traineddata.gz`];
    case 'por':
      return [`${base}/por.traineddata.gz`];
    case 'spa+eng':
      return [`${base}/spa.traineddata.gz`, `${base}/eng.traineddata.gz`];
  }
}

let ocrWorkerPromise: Promise<Tesseract.Worker> | null = null;

/**
 * One long-lived worker reused across every page of every upload.
 * Creating a worker per page costs ~2s of engine spin-up each time.
 */
async function getWorker(language: OcrLanguage): Promise<Tesseract.Worker> {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = Tesseract.createWorker(langFiles(language), 1, {
      workerPath: LOCAL_WORKER_PATH,
      corePath: LOCAL_CORE_PATH,
      langPath: LOCAL_LANG_BASE,
      gzip: true,
      cacheMethod: 'write',
    });
  }
  return ocrWorkerPromise;
}

/** OCR a single image source (data URL / object URL / remote URL). */
export async function ocrImage(
  imageUrl: string,
  language: OcrLanguage,
  onProgress?: (p: number) => void,
): Promise<string> {
  const worker = await getWorker(language);
  const result = await worker.recognize(imageUrl);
  onProgress?.(1);
  return (result?.data?.text || '').trim();
}

/** Render one PDF page to a canvas at a readable scale. */
async function renderPdfPageToCanvas(
  page: pdfjsLib.PDFPageProxy,
  scale = 2,
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

/** Read the text layer of a PDF page (fast path for digital PDFs). */
async function extractPdfPageText(page: pdfjsLib.PDFPageProxy): Promise<string> {
  const content = await page.getTextContent();
  let lastY: number | null = null;
  const lines: string[] = [];
  for (const item of content.items) {
    if (!('str' in item)) continue;
    const y = item.transform?.[5];
    if (lastY === null || (y !== undefined && Math.abs(y - lastY) > 4)) {
      lines.push(item.str);
      if (y !== undefined) lastY = y;
    } else {
      lines[lines.length - 1] += ` ${item.str}`;
    }
  }
  return lines.join('\n').trim();
}

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  /** True when every page had a usable text layer (nothing needed OCR). */
  usedTextLayer: boolean;
}

/**
 * Extract all pages of a PDF. Pages with a text layer are read directly;
 * pages with little/no text are rendered and OCR'd. That mix is what makes
 * scanned multi-page menus work.
 */
export async function extractPdf(
  file: File | ArrayBuffer,
  language: OcrLanguage,
  onProgress?: (done: number, total: number) => void,
): Promise<PdfExtractionResult> {
  const buffer = file instanceof File ? await file.arrayBuffer() : file;
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageCount = doc.numPages;
  const pages: string[] = [];
  let usedTextLayer = true;

  const worker = await getWorker(language);

  for (let p = 1; p <= pageCount; p++) {
    const page = await doc.getPage(p);
    let text = await extractPdfPageText(page);

    // Little or no text layer → it's a scan; OCR the rendered page.
    if (text.replace(/[^\p{L}\p{N}]/gu, '').length < 12) {
      usedTextLayer = false;
      const canvas = await renderPdfPageToCanvas(page, 2);
      const { data } = await worker.recognize(canvas);
      text = (data?.text || '').trim();
    }

    pages.push(text);
    onProgress?.(p, pageCount);
  }

  await doc.destroy();
  return { text: pages.join('\n\n'), pageCount, usedTextLayer };
}

/** Run OCR over several images, in order, reporting overall progress. */
export async function ocrImages(
  urls: string[],
  language: OcrLanguage,
  onProgress?: (done: number, total: number) => void,
): Promise<string[]> {
  const out: string[] = [];
  const worker = await getWorker(language);
  for (let i = 0; i < urls.length; i++) {
    const { data } = await worker.recognize(urls[i]);
    out.push((data?.text || '').trim());
    onProgress?.(i + 1, urls.length);
  }
  return out;
}

export function disposeOcrWorker(): void {
  if (ocrWorkerPromise) {
    void ocrWorkerPromise.then((w) => w.terminate()).catch(() => undefined);
    ocrWorkerPromise = null;
  }
}

/** Revoke object URLs for a set of sources without touching the files. */
export function releaseSourceUrls(sources: MenuSource[]): void {
  for (const s of sources) {
    if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
  }
}
