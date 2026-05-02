'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[52px] h-7" />; // Placeholder matching final size
    }

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="group relative inline-flex h-7 w-[52px] flex-shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2"
            style={{
                backgroundColor: isDark ? '#1B3A6B' : '#e2e8f0',
            }}
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {/* Sliding thumb with icon inside */}
            <span
                className="pointer-events-none relative inline-flex h-6 w-6 transform items-center justify-center rounded-full shadow-md ring-0 transition-transform duration-300 ease-in-out"
                style={{
                    transform: isDark ? 'translateX(24px)' : 'translateX(2px)',
                    backgroundColor: isDark ? '#C8F135' : '#ffffff',
                }}
            >
                {isDark ? (
                    <Moon className="h-3.5 w-3.5 text-brand-dark" />
                ) : (
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                )}
            </span>
        </button>
    );
}
