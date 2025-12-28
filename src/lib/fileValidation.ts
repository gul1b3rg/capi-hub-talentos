import { MAX_CV_SIZE, ALLOWED_CV_TYPE, type FileValidationResult } from '../types/upload';

export const validateCvFile = (file: File): FileValidationResult => {
  // Validar tipo
  if (file.type !== ALLOWED_CV_TYPE) {
    return {
      valid: false,
      error: 'El archivo debe ser un PDF. Por favor selecciona un archivo .pdf',
    };
  }

  // Validar tamaño
  if (file.size > MAX_CV_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `El archivo pesa ${sizeMB}MB. El tamaño máximo es 3MB. Comprime tu PDF e intenta nuevamente.`,
    };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
