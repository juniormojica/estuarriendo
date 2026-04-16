import type { Metadata } from 'next';
import PrivacyPageClient from '@/views/PrivacyPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
};

export default function PrivacyPageRoute() {
  return <ClientOnly><PrivacyPageClient /></ClientOnly>;
}
