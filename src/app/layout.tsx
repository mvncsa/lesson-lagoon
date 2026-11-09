import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { SignInModal } from '@/components/SignInModal';
import { ToastContainer } from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'LessonLagoon – Teacher-made resources, instant download',
  description:
    'Ready-to-use worksheets, slides and lesson plans aligned to the Maldives National Curriculum. Preview free, download instantly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-ink antialiased selection:bg-pri selection:text-white">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <SignInModal />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}

