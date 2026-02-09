/**
 * Design Tokens for Owner Dashboard
 * Based on "Professional Property Management" design direction
 * 
 * Palette: Stone (neutral) + Teal (accent)
 * Strategy: Subtle layering with borders + minimal shadows
 */

export const designTokens = {
    // ============================================
    // SURFACES - Whisper-quiet elevation
    // ============================================
    surface: {
        base: '#fafaf9',      // stone-50 - Page background
        card: '#ffffff',       // White - Cards
        elevated: '#ffffff',   // White - Cards on hover/focus
    },

    // ============================================
    // BORDERS - Light but findable
    // ============================================
    border: {
        subtle: '#e7e5e4',    // stone-200 - Main borders
        emphasis: '#d6d3d1',   // stone-300 - Active borders
        divider: '#f5f5f4',    // stone-100 - Very subtle dividers
    },

    // ============================================
    // TEXT HIERARCHY
    // ============================================
    text: {
        primary: '#1c1917',    // stone-900 - Headings
        secondary: '#57534e',  // stone-600 - Labels
        tertiary: '#78716c',   // stone-500 - Metadata
        disabled: '#a8a29e',   // stone-400 - Disabled state
    },

    // ============================================
    // SEMANTIC - Minimal, meaning-driven
    // ============================================
    state: {
        pending: {
            text: '#a16207',     // amber-700
            bg: '#fef3c7',       // amber-100
            border: '#fde68a',   // amber-200
        },
        approved: {
            text: '#15803d',     // green-700
            bg: '#dcfce7',       // green-100
            border: '#bbf7d0',   // green-200
        },
        rejected: {
            text: '#991b1b',     // red-800
            bg: '#fee2e2',       // red-100
            border: '#fecaca',   // red-200
        },
    },

    // ============================================
    // ACCENT - Single, purposeful
    // ============================================
    accent: {
        primary: '#0f766e',    // teal-700 - Main actions
        hover: '#115e59',      // teal-800 - Hover state
        subtle: '#f0fdfa',     // teal-50 - Hover backgrounds
        border: '#5eead4',     // teal-300 - Borders
    },

    // ============================================
    // SHADOWS - Minimal elevation
    // ============================================
    shadow: {
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        cardHover: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        dropdown: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },

    // ============================================
    // SPACING - 4px base system
    // ============================================
    spacing: {
        1: '0.25rem',  // 4px
        2: '0.5rem',   // 8px
        3: '0.75rem',  // 12px
        4: '1rem',     // 16px
        5: '1.25rem',  // 20px
        6: '1.5rem',   // 24px
        8: '2rem',     // 32px
        10: '2.5rem',  // 40px
        12: '3rem',    // 48px
    },

    // ============================================
    // BORDER RADIUS
    // ============================================
    radius: {
        sm: '0.375rem',  // 6px - Small elements
        md: '0.5rem',    // 8px - Cards, buttons
        lg: '0.75rem',   // 12px - Large containers
        full: '9999px',  // Pills, badges
    },

    // ============================================
    // TYPOGRAPHY
    // ============================================
    typography: {
        fontFamily: {
            sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", sans-serif',
        },
        fontSize: {
            xs: '0.8125rem',   // 13px
            sm: '0.875rem',    // 14px
            base: '1rem',      // 16px
            lg: '1.125rem',    // 18px
            xl: '1.25rem',     // 20px
            '2xl': '1.5rem',   // 24px
            '3xl': '2rem',     // 32px
        },
        fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
        lineHeight: {
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75',
        },
        letterSpacing: {
            tight: '-0.01em',
            normal: '0',
            wide: '0.025em',
            wider: '0.05em',
        },
    },
} as const;

// ============================================
// UTILITY CLASSES (for Tailwind)
// ============================================
export const utilityClasses = {
    // Card base
    card: 'bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow transition-shadow',

    // Segmented control
    segmentedControl: 'inline-flex bg-white border border-stone-200 rounded-lg p-1 shadow-sm',
    segmentedButton: {
        base: 'px-4 py-2 rounded-md text-sm font-medium transition-all',
        active: 'bg-stone-900 text-white shadow-sm',
        inactive: 'text-stone-600 hover:text-stone-900 hover:bg-stone-50',
    },

    // Status indicators
    status: {
        pending: 'text-amber-700 font-semibold uppercase tracking-wide text-xs',
        approved: 'text-green-700 font-semibold uppercase tracking-wide text-xs',
        rejected: 'text-red-800 font-semibold uppercase tracking-wide text-xs',
    },

    // Action buttons
    button: {
        primary: 'px-3 py-1.5 rounded-md text-xs font-medium border border-teal-600 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all',
        secondary: 'px-3 py-1.5 rounded-md text-xs font-medium border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all',
        destructive: 'p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors',
        icon: 'p-2 text-stone-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors',
    },
} as const;
