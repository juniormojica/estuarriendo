import PropertySubmissionRouterClient from '@/views/PropertySubmissionRouter';
import ClientOnly from '@/components/ClientOnly';

export default function PropertySubmissionRouterRoute() {
  return <ClientOnly><PropertySubmissionRouterClient /></ClientOnly>;
}
