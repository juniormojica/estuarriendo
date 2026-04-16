import ResetPasswordPageClient from '@/views/ResetPasswordPage';
import ClientOnly from '@/components/ClientOnly';

export default function ResetPasswordPageRoute() {
  return <ClientOnly><ResetPasswordPageClient /></ClientOnly>;
}
