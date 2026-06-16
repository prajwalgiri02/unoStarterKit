import type { ButtonHTMLAttributes, ReactNode } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    size?: 'small' | 'medium' | 'large' | 'giant';
    textSize?: string;
    loading?: boolean;
    loadingText?: string;
};

const sizeClasses: Record<string, string> = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-5 py-2.5 text-sm',
    giant: 'px-6 py-3 text-sm',
};

export default function PrimaryButton({
    children,
    size = 'medium',
    textSize,
    loading = false,
    loadingText = 'Processing...',
    disabled,
    className = '',
    type = 'button',
    ...props
}: PrimaryButtonProps) {
    const isDisabled = disabled || loading;
    const sizeClass = sizeClasses[size] ?? sizeClasses.medium;

    return (
        <button
            type={type}
            disabled={isDisabled}
            aria-busy={loading}
            className={[
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
                'bg-[#008080] text-white hover:bg-[#006666]',
                'focus:outline-none focus:ring-2 focus:ring-[#008080] focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                textSize ?? sizeClass,
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            {...props}
        >
            {loading ? loadingText : children}
        </button>
    );
}
