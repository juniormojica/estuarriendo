import type { Metadata } from 'next';
import PropertySubmissionRouterClient from '@/views/PropertySubmissionRouter';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Editar Propiedad',
  description: 'Actualiza la información de tu propiedad en EstuArriendo.',
  robots: { index: false, follow: false },
};

export default function PropertySubmissionRouterRoute() {
  return <ClientOnly><PropertySubmissionRouterClient /></ClientOnly>;
}
