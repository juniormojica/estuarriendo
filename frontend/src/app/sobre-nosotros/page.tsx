import type { Metadata } from 'next';
import AboutPageClient from '@/views/AboutPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
};

export default function AboutPageRoute() {
  return <ClientOnly><AboutPageClient /></ClientOnly>;
}
