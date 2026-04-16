import SuperAdminDashboardClient from '@/views/SuperAdminDashboard';
import ClientOnly from '@/components/ClientOnly';

export default function SuperAdminDashboardRoute() {
  return <ClientOnly><SuperAdminDashboardClient /></ClientOnly>;
}
