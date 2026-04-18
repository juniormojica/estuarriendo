import type { Metadata } from 'next';
import AdminDashboardClient from '@/views/AdminDashboard';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Panel de Administración',
  description: 'Gestiona propiedades, usuarios y configuraciones del sistema EstuArriendo.',
  robots: { index: false, follow: false },
};

export default function AdminDashboardRoute() {
  return <ClientOnly><AdminDashboardClient /></ClientOnly>;
}
