import ForgotPasswordPageClient from '@/views/ForgotPasswordPage';
import ClientOnly from '@/components/ClientOnly';

export default function ForgotPasswordPageRoute() {
  return <ClientOnly><ForgotPasswordPageClient /></ClientOnly>;
}
