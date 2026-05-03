import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Lato } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta',
});

const lato = Lato({ 
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-lato',
});

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
    <html lang="es" className={`${jakarta.variable} ${lato.variable}`} suppressHydrationWarning>
      <body className="font-lato transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light">
          <Providers>
            <div className="min-h-screen bg-gray-50 flex flex-col transition-colors duration-300">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <WhatsAppButton />
              <Footer />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
