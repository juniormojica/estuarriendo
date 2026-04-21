import type { Metadata } from 'next';
import OwnerDashboardClient from '@/views/OwnerDashboard';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Mis Propiedades',
  description: 'Administra todas tus propiedades publicadas en EstuArriendo.',
  robots: { index: false, follow: false },
};

export default function OwnerDashboardRoute() {
  return <ClientOnly><OwnerDashboardClient /></ClientOnly>;
}
