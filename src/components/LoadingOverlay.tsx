interface LoadingOverlayProps {
  isLoading: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner animado */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />

        {/* Texto */}
        <p className="text-lg font-medium text-text">Iniciando sesión...</p>
      </div>
    </div>
  );
};
