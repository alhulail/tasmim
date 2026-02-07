import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, iconPosition = 'start', ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && iconPosition === 'start' && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          dir="auto"
          className={cn(
            'flex h-12 w-full rounded-xl border-2 bg-white px-4 py-3 text-base transition-all duration-200',
            'border-tasmim-sand-200 placeholder:text-muted-foreground',
            'focus:border-tasmim-gold-500 focus:outline-none focus:ring-2 focus:ring-tasmim-gold-200',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-tasmim-navy-700 dark:bg-tasmim-navy-900 dark:focus:border-tasmim-gold-500 dark:focus:ring-tasmim-gold-900/30',
            icon && iconPosition === 'start' && 'ps-12',
            icon && iconPosition === 'end' && 'pe-12',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
            className
          )}
          ref={ref}
          {...props}
        />
        {icon && iconPosition === 'end' && (
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground">
            {icon}
          </div>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
