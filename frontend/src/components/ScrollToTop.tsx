'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const ScrollToTop = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Use timeout to ensure it runs after DOM elements have painted
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
        }, 0);
    }, [pathname, searchParams]);

    return null;
};

export default ScrollToTop;
