import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faGlobe,
  faFileLines,
  faShieldHalved,
  faBolt,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/*blur*/}
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="h-[600px] w-[800px] -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 text-center md:py-40">
        {/* badge */}
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <FontAwesomeIcon icon={faBolt} className="text-primary" />
          <span>Now in public beta</span>
        </div>

        {/* title */}
        <h1 className="mx-auto mb-8 max-w-4xl text-5xl font-bold tracking-tighter text-foreground md:text-8xl leading-[1.05]">
          Your second brain for structured information
        </h1>

        {/* description */}
        <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
          Organize your knowledge with powerful workspaces, rich documents, and
          seamless collaboration. Built for teams who value clarity and speed.
        </p>

        {/* buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-6">
          <Link
            href="/register"
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 hover:bg-primary/70 duration-300 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            Get Started Free
            <FontAwesomeIcon icon={faArrowRight} className="ml-1 w-3.5 h-3.5" />
          </Link>
          <button className="flex h-12 items-center justify-center rounded-lg bg-secondary border border-border px-8 text-sm font-bold text-secondary-foreground transition-all hover:bg-accent duration-300">
            View Demo
          </button>
        </div>

        <p className="text-xs text-muted-foreground/60 mb-24">
          No credit card required • Free for personal use
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <FeatureCard
            icon={faGlobe}
            title="Workspaces"
            description="Organize projects with dedicated workspaces. Keep your knowledge structured and accessible."
          />
          <FeatureCard
            icon={faFileLines}
            title="Rich Documents"
            description="Create beautiful documents with our block-based editor. Embed media, code, and more."
          />
          <FeatureCard
            icon={faShieldHalved}
            title="Secure by Default"
            description="End-to-end encryption for sensitive data. Your knowledge stays private."
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: IconDefinition;
  title: string;
  description: string;
}) => (
  <div className="rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/60 group">
    <div className="mb-4 text-primary transition-transform duration-300">
      <FontAwesomeIcon icon={icon} size="xl" />
    </div>
    <h3 className="mb-2 font-bold text-foreground">{title}</h3>
    <p className="text-sm leading-relaxed text-muted-foreground">
      {description}
    </p>
  </div>
);
