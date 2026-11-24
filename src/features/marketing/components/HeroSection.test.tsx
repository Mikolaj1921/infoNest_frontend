// ai tests - comp hero section

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HeroSection } from './HeroSection';

// ua: мок Next.js Link для перевірки маршруту без Next.js навігації
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ua: мок Font Awesome для перевірки рендерингу іконок
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: { iconName: string } }) => (
    <span data-testid={`icon-${icon.iconName}`} />
  ),
}));

describe('HeroSection', () => {
  it('1. має рендерити головний заголовок', () => {
    render(<HeroSection />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Your second brain for structured information',
      }),
    ).not.toBeNull();
  });

  it('2. має рендерити опис головної секції', () => {
    render(<HeroSection />);

    expect(
      screen.getByText(
        'Organize your knowledge with powerful workspaces, rich documents, and seamless collaboration. Built for teams who value clarity and speed.',
      ),
    ).not.toBeNull();
  });

  it('3. має відображати бейдж публічної бета-версії', () => {
    render(<HeroSection />);

    expect(screen.getByText('Now in public beta')).not.toBeNull();
  });

  it('4. має рендерити посилання Get Started Free', () => {
    render(<HeroSection />);

    const link = screen.getByRole('link', {
      name: /Get Started Free/i,
    });

    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/register');
  });

  it('5. має рендерити кнопку View Demo', () => {
    render(<HeroSection />);

    expect(screen.getByRole('button', { name: 'View Demo' })).not.toBeNull();
  });

  it('6. має відображати інформацію про безкоштовне використання', () => {
    render(<HeroSection />);

    expect(
      screen.getByText('No credit card required • Free for personal use'),
    ).not.toBeNull();
  });

  it('7. має рендерити картку Workspaces', () => {
    render(<HeroSection />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Workspaces',
      }),
    ).not.toBeNull();

    expect(
      screen.getByText(
        'Organize projects with dedicated workspaces. Keep your knowledge structured and accessible.',
      ),
    ).not.toBeNull();
  });

  it('8. має рендерити картку Rich Documents', () => {
    render(<HeroSection />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Rich Documents',
      }),
    ).not.toBeNull();

    expect(
      screen.getByText(
        'Create beautiful documents with our block-based editor. Embed media, code, and more.',
      ),
    ).not.toBeNull();
  });

  it('9. має рендерити картку Secure by Default', () => {
    render(<HeroSection />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Secure by Default',
      }),
    ).not.toBeNull();

    expect(
      screen.getByText(
        'End-to-end encryption for sensitive data. Your knowledge stays private.',
      ),
    ).not.toBeNull();
  });

  it('10. має рендерити рівно три картки функціональностей', () => {
    render(<HeroSection />);

    const cards = screen.getAllByRole('heading', { level: 3 });

    expect(cards).toHaveLength(3);
  });

  it('11. має рендерити іконки основних функціональностей', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('icon-globe')).not.toBeNull();
    expect(screen.getByTestId('icon-file-lines')).not.toBeNull();
    expect(screen.getByTestId('icon-shield-halved')).not.toBeNull();
  });

  it('12. має рендерити іконку кнопки та бейджа', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('icon-bolt')).not.toBeNull();
    expect(screen.getByTestId('icon-arrow-right')).not.toBeNull();
  });
});
