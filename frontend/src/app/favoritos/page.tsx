import FavoritesPageClient from '@/views/FavoritesPage';
import ClientOnly from '@/components/ClientOnly';

export default function FavoritesPageRoute() {
  return <ClientOnly><FavoritesPageClient /></ClientOnly>;
}
