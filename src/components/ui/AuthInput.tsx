import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// ua: інтерфейс пропсів для AuthInput - кастомні пропси (label, error)
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// ua: атомарний інпут з підтримкою станів помилки валідації, фокусу та видимості пароля
export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type, className, ...props }, ref) => {
    // ua: стан видимості пароля
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // ua: визначаємо, чи поле є полем пароля
    const isPasswordField = type === 'password';

    // ua: змінюємо тип поля залежно від стану видимості
    const inputType = isPasswordField && isPasswordVisible ? 'text' : type;

    return (
      <div className="space-y-1.5 w-full text-left">
        {label && (
          <label className="text-xs font-medium text-muted-foreground">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`h-10 w-full rounded-lg border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-50 ${
              isPasswordField ? 'pr-10' : ''
            } ${
              error
                ? 'border-destructive focus:border-destructive focus:ring-destructive/10'
                : 'border-border'
            } ${className ?? ''}`}
            {...props}
          />

          {/* ua: кнопка перемикання видимості пароля */}
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible((previous) => !previous)}
              disabled={props.disabled}
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              aria-pressed={isPasswordVisible}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon
                icon={isPasswordVisible ? faEyeSlash : faEye}
                className="h-4 w-4"
              />
            </button>
          )}
        </div>

        {/* ua: повідомлення про помилку валідації */}
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
