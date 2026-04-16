'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ScrollToTop = () => {
    const { pathname, search } = usePathname();

    useEffect(() => {
        // Use timeout to ensure it runs after DOM elements have painted
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
        }, 0);
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;
