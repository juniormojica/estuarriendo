import SuccessPaymentPageClient from '@/views/SuccessPaymentPage';
import ClientOnly from '@/components/ClientOnly';

export default function SuccessPaymentPageRoute() {
  return <ClientOnly><SuccessPaymentPageClient /></ClientOnly>;
}
