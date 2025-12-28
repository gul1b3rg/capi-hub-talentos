interface ProgressBarProps {
  progress: number; // 0-100
  status: 'uploading' | 'success' | 'error';
  className?: string;
}

const ProgressBar = ({ progress, status, className = '' }: ProgressBarProps) => {
  const getBarColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/10">
        <div
          className={`h-full transition-all duration-300 ease-out ${getBarColor()}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-secondary/70">
        {status === 'uploading' && `Subiendo... ${Math.round(progress)}%`}
        {status === 'success' && 'Archivo subido correctamente'}
        {status === 'error' && 'Error al subir el archivo'}
      </p>
    </div>
  );
};

export default ProgressBar;
