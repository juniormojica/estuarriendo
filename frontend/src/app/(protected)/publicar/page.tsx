import type { Metadata } from 'next';
import PropertySubmissionRouterClient from '@/views/PropertySubmissionRouter';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Publicar Propiedad',
  description: 'Publica tu propiedad en EstuArriendo y llega a miles de estudiantes universitarios que buscan alojamiento.',
  robots: { index: false, follow: false },
};

export default function PropertySubmissionRouterRoute() {
  return <ClientOnly><PropertySubmissionRouterClient /></ClientOnly>;
}
