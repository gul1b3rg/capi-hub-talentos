import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

const InfiniteScrollTrigger = ({ onLoadMore, hasMore, loading }: InfiniteScrollTriggerProps) => {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Cuando el trigger es visible, cargar más
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: '100px', // Comienza a cargar 100px antes de llegar al final
        threshold: 0.1,
      }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onLoadMore, hasMore, loading]);

  if (!hasMore) return null;

  return (
    <div ref={observerRef} className="flex justify-center py-8">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-secondary/60">
          <svg
            className="h-5 w-5 animate-spin text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Cargando más ofertas...</span>
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollTrigger;
