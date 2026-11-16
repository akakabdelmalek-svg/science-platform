/**
 * IndexedDB storage helper for imported lesson files (.docx, .xlsx, .pptx, .pdf)
 * Works completely client-side (including static hosting like Vercel) without localStorage 5MB quota limits.
 */

const DB_NAME = 'science_platform_files_db';
const DB_VERSION = 1;
const STORE_NAME = 'lesson_attachments';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLessonFile(lessonId: string, dataUrl: string): Promise<void> {
  if (!lessonId || !dataUrl) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(dataUrl, lessonId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn('Failed to persist file in IndexedDB:', err);
  }
}

export async function getLessonFile(lessonId: string): Promise<string | null> {
  if (!lessonId) return null;
  try {
    const db = await openDatabase();
    const result = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(lessonId);
      req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return null;
  }
}

export async function deleteLessonFile(lessonId: string): Promise<void> {
  if (!lessonId) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(lessonId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore errors
  }
}

/**
 * Converts a data URL to a Blob URL for reliable large-file downloads across all browsers (including Vercel)
 */
export function triggerDataUrlDownload(dataUrl: string, fileName: string, fallbackMime = 'application/octet-stream'): void {
  if (!dataUrl) return;
  try {
    const parts = dataUrl.split(',');
    if (parts.length === 2 && parts[0].includes(';base64')) {
      const mimeMatch = parts[0].match(/data:([^;]+);/);
      const mime = mimeMatch ? mimeMatch[1] : fallbackMime;
      const byteChars = atob(parts[1]);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return;
    }
  } catch (err) {
    console.warn('Blob conversion fallback:', err);
  }

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
