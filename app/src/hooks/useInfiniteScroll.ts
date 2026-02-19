import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom to trigger load more (in pixels)
  rootMargin?: string; // Root margin for intersection observer
  enabled?: boolean; // Whether infinite scroll is enabled
}

interface UseInfiniteScrollReturn {
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function useInfiniteScroll(
  onLoadMore: () => void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 100,
    rootMargin = '0px',
    enabled = true
  } = options;

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          setIsLoading(true);
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px 0px ${threshold}px 0px`,
        threshold: 0.1
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onLoadMore, enabled, isLoading, rootMargin]);

  return {
    loadMoreRef,
    isLoading,
    setIsLoading
  };
}
