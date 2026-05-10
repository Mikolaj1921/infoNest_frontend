// Dashboard layout - Provides the main structure for all dashboard pages

// components - layout
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { DashboardHeader } from '@/components/layout/Header/DashboardHeader';
import { DashboardFooter } from '@/components/layout/Footer/DashboardFooter';

// features
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          <div className="mx-auto w-full max-w-7xl flex-1">{children}</div>
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
}
