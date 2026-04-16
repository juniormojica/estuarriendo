import StudentRequestPageClient from '@/views/StudentRequestPage';
import ClientOnly from '@/components/ClientOnly';

export default function StudentRequestPageRoute() {
  return <ClientOnly><StudentRequestPageClient /></ClientOnly>;
}
