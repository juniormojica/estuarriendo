import OpportunitiesPageClient from '@/views/OpportunitiesPage';
import ClientOnly from '@/components/ClientOnly';

export default function OpportunitiesPageRoute() {
  return <ClientOnly><OpportunitiesPageClient /></ClientOnly>;
}
