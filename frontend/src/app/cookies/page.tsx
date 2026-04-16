import type { Metadata } from 'next';
import CookiesPageClient from '@/views/CookiesPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Política de Cookies',
};

export default function CookiesPageRoute() {
  return <ClientOnly><CookiesPageClient /></ClientOnly>;
}
