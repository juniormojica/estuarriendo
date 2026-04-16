import LoginPageClient from '@/views/LoginPage';
import ClientOnly from '@/components/ClientOnly';

export default function LoginPageRoute() {
  return <ClientOnly><LoginPageClient /></ClientOnly>;
}
