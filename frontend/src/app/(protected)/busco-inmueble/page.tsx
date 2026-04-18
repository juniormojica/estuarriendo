import type { Metadata } from 'next';
import StudentRequestPageClient from '@/views/StudentRequestPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Busco Inmueble',
  description: 'Publica tu búsqueda de alojamiento universitario y permite que los propietarios te encuentren en EstuArriendo.',
  robots: { index: false, follow: false },
};

export default function StudentRequestPageRoute() {
  return <ClientOnly><StudentRequestPageClient /></ClientOnly>;
}
