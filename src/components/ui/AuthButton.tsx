import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

// ua: кнопка для форм з вбудованим станом завантаження (спінером)
export const AuthButton = ({
  children,
  isLoading,
  ...props
}: AuthButtonProps) => {
  return (
    <button
      disabled={isLoading || props.disabled}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      {...props}
    >
      {isLoading ? (
        <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};
