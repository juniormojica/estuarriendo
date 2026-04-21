import type { Metadata } from 'next';
import LoginPageClient from '@/views/LoginPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Ingresa a tu cuenta de EstuArriendo para gestionar tus propiedades o encontrar el alojamiento perfecto cerca de tu universidad.',
};

export default function LoginPageRoute() {
  return <ClientOnly><LoginPageClient /></ClientOnly>;
}
