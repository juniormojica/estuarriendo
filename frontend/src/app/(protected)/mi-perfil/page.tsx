import UserProfileClient from '@/views/UserProfile';
import ClientOnly from '@/components/ClientOnly';

export default function UserProfileRoute() {
  return <ClientOnly><UserProfileClient /></ClientOnly>;
}
