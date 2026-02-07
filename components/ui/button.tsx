import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-tasmim-navy-800 to-tasmim-navy-600 text-white hover:from-tasmim-navy-700 hover:to-tasmim-navy-500 shadow-lg shadow-tasmim-navy-900/20',
        gold:
          'bg-gradient-to-r from-tasmim-gold-500 to-tasmim-gold-400 text-tasmim-navy-900 hover:from-tasmim-gold-400 hover:to-tasmim-gold-300 shadow-lg shadow-tasmim-gold-500/20',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border-2 border-tasmim-navy-200 bg-transparent text-tasmim-navy-800 hover:bg-tasmim-navy-50 dark:border-tasmim-navy-700 dark:text-tasmim-navy-100 dark:hover:bg-tasmim-navy-800',
        secondary:
          'bg-tasmim-sand-100 text-tasmim-navy-800 hover:bg-tasmim-sand-200 dark:bg-tasmim-navy-800 dark:text-tasmim-sand-100 dark:hover:bg-tasmim-navy-700',
        ghost:
          'hover:bg-tasmim-sand-100 hover:text-tasmim-navy-900 dark:hover:bg-tasmim-navy-800 dark:hover:text-tasmim-sand-100',
        link: 'text-tasmim-navy-800 underline-offset-4 hover:underline dark:text-tasmim-gold-400',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-13 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-13 w-13',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
