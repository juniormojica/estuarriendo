import type { Metadata } from 'next';
import ForgotPasswordPageClient from '@/views/ForgotPasswordPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña',
  description: 'Solicita el restablecimiento de tu contraseña de EstuArriendo. Te enviaremos un enlace a tu correo electrónico.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPageRoute() {
  return <ClientOnly><ForgotPasswordPageClient /></ClientOnly>;
}
