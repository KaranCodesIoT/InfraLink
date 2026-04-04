import { useEffect, useRef, useCallback } from 'react';

/**
 * useInfiniteScroll
 * @param {Function} callback - Function to call when bottom is reached
 * @param {boolean} hasMore - Whether there is more data to load
 * @param {boolean} isLoading - Whether a load is already in progress
 * @returns {lastElementRef} - Ref to attach to the observer target
 */
export default function useInfiniteScroll(callback, hasMore, isLoading) {
  const observer = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, callback]
  );

  return { lastElementRef };
}
