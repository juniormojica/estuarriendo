import AdminDashboardClient from '@/views/AdminDashboard';
import ClientOnly from '@/components/ClientOnly';

export default function AdminDashboardRoute() {
  return <ClientOnly><AdminDashboardClient /></ClientOnly>;
}
