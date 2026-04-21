import type { Metadata } from 'next';
import RegistrationPageClient from '@/views/RegistrationPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description: 'Regístrate en EstuArriendo como propietario o estudiante y empieza a conectar con el alojamiento universitario ideal.',
};

export default function RegistrationPageRoute() {
  return <ClientOnly><RegistrationPageClient /></ClientOnly>;
}
