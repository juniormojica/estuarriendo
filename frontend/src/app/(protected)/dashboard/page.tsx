import OwnerDashboardClient from '@/views/OwnerDashboard';
import ClientOnly from '@/components/ClientOnly';

export default function OwnerDashboardRoute() {
  return <ClientOnly><OwnerDashboardClient /></ClientOnly>;
}
