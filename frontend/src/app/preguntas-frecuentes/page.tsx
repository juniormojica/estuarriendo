import type { Metadata } from 'next';
import FAQPageClient from '@/views/FAQPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
};

export default function FAQPageRoute() {
  return <ClientOnly><FAQPageClient /></ClientOnly>;
}
