import Link from 'next/link';

interface AuthLegalNoticeProps {
  mode: 'login' | 'register';
}

// ua: спільний компонент юридичного повідомлення для сторінок авторизації
export const AuthLegalNotice = ({ mode }: AuthLegalNoticeProps) => {
  const message =
    mode === 'login'
      ? 'By signing in, you agree to our'
      : 'By creating an account, you agree to our';

  return (
    <div className="text-center text-xs text-muted-foreground/60 px-4">
      {message}{' '}
      <Link
        href="/TermsOfService"
        className="font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
      >
        Terms of Service
      </Link>{' '}
      and{' '}
      <Link
        href="/PrivacyPolicy"
        className="font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
      >
        Privacy Policy
      </Link>
    </div>
  );
};
