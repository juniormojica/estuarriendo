import type { Metadata } from 'next';
import TermsPageClient from '@/views/TermsPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
};

export default function TermsPageRoute() {
  return <ClientOnly><TermsPageClient /></ClientOnly>;
}
