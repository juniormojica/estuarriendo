import * as React from 'react';

import { cn } from '../../lib/utils';

// Note: I'm not using class-variance-authority yet to keep it simple and avoid another dependency if not needed, 
// but for a robust system it's recommended. For now I'll use simple switch or map.
// Actually, I'll stick to simple props for now to avoid installing 'class-variance-authority' if I didn't plan for it.
// Wait, I didn't put 'class-variance-authority' in the install list. I should probably stick to clsx/tailwind-merge manual handling or install it.
// I'll stick to manual handling for simplicity as I didn't ask for permission for cva.

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: 'border-transparent bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'border-transparent bg-primary-100 text-primary-900 hover:bg-primary-200',
        destructive: 'border-transparent bg-red-500 text-white hover:bg-red-600',
        outline: 'text-gray-900 border-gray-200 hover:bg-gray-100',
        success: 'border-transparent bg-emerald-500 text-white hover:bg-emerald-600',
        warning: 'border-transparent bg-amber-500 text-white hover:bg-amber-600',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
