import type { Metadata } from 'next';
import UserProfileClient from '@/views/UserProfile';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Mi Perfil',
  description: 'Gestiona tu información personal y preferencias en EstuArriendo.',
  robots: { index: false, follow: false },
};

export default function UserProfileRoute() {
  return <ClientOnly><UserProfileClient /></ClientOnly>;
}
