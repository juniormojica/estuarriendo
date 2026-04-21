import type { Metadata } from 'next';
import FavoritesPageClient from '@/views/FavoritesPage';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Mis Favoritos',
  description: 'Consulta las propiedades que guardaste como favoritas en EstuArriendo.',
};

export default function FavoritesPageRoute() {
  return <ClientOnly><FavoritesPageClient /></ClientOnly>;
}
