import type { Metadata } from 'next';
import HowToSearchPageClient from '@/views/HowToSearchPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Cómo Buscar Inmueble',
};

export default function HowToSearchPageRoute() {
  return <ClientOnly><HowToSearchPageClient /></ClientOnly>;
}
