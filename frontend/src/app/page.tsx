import type { Metadata } from 'next';
import HomePageClient from '@/views/HomePage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Encuentra tu alojamiento universitario ideal',
  description: 'Busca apartamentos, habitaciones y pensiones cerca de tu universidad en Colombia.',
};

export default function Home() {
  return <ClientOnly><HomePageClient /></ClientOnly>;
}
