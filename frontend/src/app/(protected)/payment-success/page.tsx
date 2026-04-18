import type { Metadata } from 'next';
import SuccessPaymentPageClient from '@/views/SuccessPaymentPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Pago Exitoso',
  description: 'Tu pago ha sido procesado exitosamente en EstuArriendo.',
  robots: { index: false, follow: false },
};

export default function SuccessPaymentPageRoute() {
  return <ClientOnly><SuccessPaymentPageClient /></ClientOnly>;
}
