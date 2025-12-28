export type UploadStatus = 'idle' | 'validating' | 'uploading' | 'success' | 'error';

export interface UploadState {
  status: UploadStatus;
  progress: number; // 0-100
  error: string | null;
  fileName: string | null;
  fileSize: number | null;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// Constantes compartidas
export const MAX_CV_SIZE = 3 * 1024 * 1024; // 3MB
export const ALLOWED_CV_TYPE = 'application/pdf';
export const MAX_UPLOAD_RETRIES = 2;
