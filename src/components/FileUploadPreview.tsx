import { HiCheckCircle, HiExclamationCircle, HiDocument } from 'react-icons/hi2';
import { formatFileSize } from '../lib/fileValidation';
import type { UploadStatus } from '../types/upload';

interface FileUploadPreviewProps {
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  error?: string | null;
}

const FileUploadPreview = ({ fileName, fileSize, status, error }: FileUploadPreviewProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <HiCheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <HiExclamationCircle className="h-5 w-5 text-red-600" />;
      default:
        return <HiDocument className="h-5 w-5 text-secondary/60" />;
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-300 bg-green-50';
      case 'error':
        return 'border-red-300 bg-red-50';
      case 'uploading':
        return 'border-primary/30 bg-primary/5';
      default:
        return 'border-secondary/20 bg-secondary/5';
    }
  };

  return (
    <div className={`mt-3 flex items-start gap-3 rounded-2xl border p-3 ${getBorderColor()}`}>
      <div className="flex-shrink-0 pt-0.5">{getStatusIcon()}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-secondary">{fileName}</p>
        <p className="text-xs text-secondary/60">{formatFileSize(fileSize)}</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default FileUploadPreview;
