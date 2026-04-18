import type { Metadata } from 'next';
import SuperAdminDashboardClient from '@/views/SuperAdminDashboard';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Super Admin',
  description: 'Panel de control de Super Administrador de EstuArriendo.',
  robots: { index: false, follow: false },
};

export default function SuperAdminDashboardRoute() {
  return <ClientOnly><SuperAdminDashboardClient /></ClientOnly>;
}
