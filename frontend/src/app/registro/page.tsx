import RegistrationPageClient from '@/views/RegistrationPage';
import ClientOnly from '@/components/ClientOnly';

export default function RegistrationPageRoute() {
  return <ClientOnly><RegistrationPageClient /></ClientOnly>;
}
