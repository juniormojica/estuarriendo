import type { Metadata } from 'next';
import OpportunitiesPageClient from '@/views/OpportunitiesPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Solicitudes de Estudiantes',
  description: 'Consulta las solicitudes de alojamiento de estudiantes universitarios en tu ciudad.',
  robots: { index: false, follow: false },
};

export default function OpportunitiesPageRoute() {
  return <ClientOnly><OpportunitiesPageClient /></ClientOnly>;
}
