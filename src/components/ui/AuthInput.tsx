import React from 'react';

// ua: інтерфейс пропсів для AuthInput - кастомні пропси (label, error)
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// ua: атомарний інпут з підтримкою станів помилки валідації та фокусу
export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full text-left">
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        <input
          ref={ref}
          className={`h-10 w-full rounded-lg border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-50 ${
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive/10'
              : 'border-border'
          }`}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive animate-in fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  },
);

AuthInput.displayName = 'AuthInput';
