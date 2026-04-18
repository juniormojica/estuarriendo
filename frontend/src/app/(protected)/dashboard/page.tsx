import type { Metadata } from 'next';
import OwnerDashboardClient from '@/views/OwnerDashboard';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Mi Dashboard',
  description: 'Resumen de tus propiedades, solicitudes y actividad reciente en EstuArriendo.',
  robots: { index: false, follow: false },
};

export default function OwnerDashboardRoute() {
  return <ClientOnly><OwnerDashboardClient /></ClientOnly>;
}
