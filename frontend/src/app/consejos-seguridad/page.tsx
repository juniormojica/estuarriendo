import type { Metadata } from 'next';
import SecurityTipsPageClient from '@/views/SecurityTipsPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Consejos de Seguridad',
};

export default function SecurityTipsPageRoute() {
  return <ClientOnly><SecurityTipsPageClient /></ClientOnly>;
}
