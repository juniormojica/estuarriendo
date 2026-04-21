'use client';
import { useEffect } from 'react';

/**
 * Scrolls to the top of the page whenever any of the dependency values change.
 * Useful for multi-step forms, tab navigations, or any component that changes
 * significant content without changing the URL.
 * 
 * @example
 * // Scroll to top when 'currentStep' changes
 * useScrollToTop([currentStep]);
 * 
 * @example
 * // Scroll to top smoothly when 'activeTab' changes
 * useScrollToTop([activeTab], 'smooth');
 * 
 * @param deps - Array of values to watch for changes
 * @param behavior - 'smooth' for animated scroll, 'instant' or 'auto' for immediate (default: 'instant')
 */
export function useScrollToTop(
    deps: any[],
    behavior: ScrollBehavior = 'instant'
) {
    useEffect(() => {
        // Use timeout to ensure it runs after DOM elements have painted
        const timer = setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior
            });
        }, 0);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
