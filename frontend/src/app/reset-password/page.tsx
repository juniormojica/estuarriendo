import type { Metadata } from 'next';
import ResetPasswordPageClient from '@/views/ResetPasswordPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña',
  description: 'Establece tu nueva contraseña para acceder a EstuArriendo.',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPageRoute() {
  return <ClientOnly><ResetPasswordPageClient /></ClientOnly>;
}
