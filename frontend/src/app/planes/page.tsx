import type { Metadata } from 'next';
import PlansPageClient from '@/views/PlansPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Planes',
};

export default function PlansPageRoute() {
  return <ClientOnly><PlansPageClient /></ClientOnly>;
}
