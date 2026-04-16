import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    template: '%s | EstuArriendo',
    default: 'EstuArriendo - Tu alojamiento universitario ideal',
  },
  description: 'Encuentra apartamentos, habitaciones, pensiones y aparta-estudios cerca de tu universidad. Alojamiento ideal para estudiantes en Valledupar.',
  keywords: ['arriendo', 'estudiantes', 'valledupar', 'apartamentos', 'habitaciones', 'universidad'],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'EstuArriendo',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
