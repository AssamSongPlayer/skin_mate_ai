import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/common/Toast';

export const metadata: Metadata = {
  title: 'Skin Mate – AI-Powered Personalized Skincare Assistant',
  description:
    'Your Skin. Your Routine. Your AI Companion. Personalized AI skincare assessments, dynamic product suggestions, individual routines, and master timetables.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="bg-[#0B0B0F] text-[#F5F3FF] antialiased h-full overflow-hidden">
        <AppProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
