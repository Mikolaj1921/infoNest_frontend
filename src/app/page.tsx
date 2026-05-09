// Root page - Landing page for the application

// eslint-disable-next-line
import api from '@/lib/axios';

// components - layout
import { MarketingHeader } from '@/components/layout/Header/MarketingHeader';
import { MarketingFooter } from '@/components/layout/Footer/MarketingFooter';

// features
import { HeroSection } from '@/features/marketing/components/HeroSection';

export default function Home() {
  // Логування API URL для перевірки
  if (process.env.NODE_ENV === 'development') {
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* header */}
      <MarketingHeader />

      <main className="flex-1 pt-16">
        {/* hero section */}
        <HeroSection />
      </main>

      {/* footer */}
      <MarketingFooter />
    </div>
  );
}
