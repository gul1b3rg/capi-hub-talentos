import { supabase } from './supabaseClient';

const MAX_SIZE = 512;
const QUALITY = 0.85;
const BUCKET = 'company-logos';
const RETRY_LIMIT = 2;
const CV_BUCKET = 'cvs';
const MAX_CV_SIZE = 3 * 1024 * 1024; // 3MB

export type UploadProgressCallback = (progress: number) => void;

const resizeImage = (blob: Blob) =>
  new Promise<Blob>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('No pudimos procesar el logo. Intenta con otra imagen.'));
    }, 10000);
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      clearTimeout(timeout);
      const canvas = document.createElement('canvas');
      let { width, height } = image;

      if (width > height && width > MAX_SIZE) {
        height = (height / width) * MAX_SIZE;
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width = (width / height) * MAX_SIZE;
        height = MAX_SIZE;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Context not available'));
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (compressed) => {
          URL.revokeObjectURL(url);
          if (!compressed) {
            reject(new Error('No se pudo comprimir la imagen'));
            return;
          }
          resolve(compressed);
        },
        'image/webp',
        QUALITY,
      );
    };
    image.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo cargar la imagen para comprimir.'));
    };
    image.src = url;
  });

const withTimeout = async <T>(promise: Promise<T>, message: string, timeoutMs = 10000) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });

const uploadCompressedBlob = async (blob: Blob, referenceId: string, attempt = 0): Promise<string> => {
  // eslint-disable-next-line no-console
  console.log('[storageService] Compressing logo for', referenceId, { size: blob.size, type: blob.type });
  const compressed = await resizeImage(blob);
  // eslint-disable-next-line no-console
  console.log('[storageService] Uploading logo', { referenceId, compressedSize: compressed.size });
  const extension = 'webp';
  const filePath = `logos/${referenceId}-${Date.now()}.${extension}`;
  const uploadPromise = supabase.storage.from(BUCKET).upload(filePath, compressed, {
    contentType: 'image/webp',
    upsert: true,
  });
  const { error } = await withTimeout(
    uploadPromise,
    'La subida del logo tardo demasiado. Intenta nuevamente o usa otro archivo/URL.',
  );

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error uploading logo', error.message);
    if (attempt < RETRY_LIMIT) {
      // eslint-disable-next-line no-console
      console.warn('Retrying upload...', attempt + 1);
      return uploadCompressedBlob(blob, referenceId, attempt + 1);
    }
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  // eslint-disable-next-line no-console
  console.log('[storageService] Uploaded logo URL', publicUrl);
  return publicUrl;
};

export const uploadCompanyLogoFromUrl = async (logoUrl: string, referenceId: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let response: Response;
  try {
    response = await fetch(logoUrl, { signal: controller.signal });
  } catch (error) {
    clearTimeout(timeout);
    throw new Error(
      error instanceof DOMException && error.name === 'AbortError'
        ? 'La descarga del logo tardo demasiado. Intenta con otra URL.'
        : 'No pudimos descargar el logo desde la URL proporcionada.',
    );
  }
  clearTimeout(timeout);
  if (!response.ok) {
    throw new Error('No pudimos descargar el logo desde la URL proporcionada.');
  }
  const blob = await response.blob();
  return uploadCompressedBlob(blob, referenceId);
};

export const uploadCompanyLogoFromFile = async (file: File, referenceId: string) => {
  return uploadCompressedBlob(file, referenceId);
};

export const uploadCvFile = async (file: File, userId: string, onProgress?: UploadProgressCallback, attempt = 0): Promise<string> => {
  // eslint-disable-next-line no-console
  console.log('[storageService] Upload CV start', { name: file.name, size: file.size, type: file.type });
  if (file.type !== 'application/pdf') {
    throw new Error('El CV debe ser un archivo PDF.');
  }
  if (file.size > MAX_CV_SIZE) {
    // eslint-disable-next-line no-console
    console.warn('[storageService] CV rejected: too large', { size: file.size });
    throw new Error('El CV excede 3MB. Por favor sube un archivo mas liviano.');
  }

  const path = `cvs/${userId}-${Date.now()}.pdf`;

  // Simular progreso suave durante upload
  let progressInterval: number | null = null;

  if (onProgress) {
    onProgress(10); // Inicio más visible

    let currentProgress = 10;
    progressInterval = setInterval(() => {
      // Incremento más lento y suave (nunca llega a 95)
      currentProgress = Math.min(92, currentProgress + Math.random() * 8);
      onProgress(currentProgress);
    }, 500); // Intervalo más largo para progreso más suave
  }

  try {
    const uploadPromise = supabase.storage.from(CV_BUCKET).upload(path, file, {
      upsert: true,
      contentType: 'application/pdf',
    });

    // Timeout más largo para archivos grandes (60 segundos)
    const { error } = await withTimeout(
      uploadPromise,
      'La subida del CV tardo demasiado. Intenta nuevamente o verifica tu conexión a internet.',
      60000,
    );

    if (progressInterval) clearInterval(progressInterval);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error uploading CV', error.message);

      // Reintentar si no se alcanzó el límite
      if (attempt < RETRY_LIMIT) {
        // eslint-disable-next-line no-console
        console.warn('Retrying CV upload...', attempt + 1);
        if (onProgress) onProgress(0); // Reset progress
        return uploadCvFile(file, userId, onProgress, attempt + 1);
      }

      throw error;
    }

    if (onProgress) onProgress(100);
  } catch (err) {
    if (progressInterval) clearInterval(progressInterval);
    throw err;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(CV_BUCKET).getPublicUrl(path);

  // eslint-disable-next-line no-console
  console.log('[storageService] CV uploaded', { url: publicUrl });
  return publicUrl;
};
