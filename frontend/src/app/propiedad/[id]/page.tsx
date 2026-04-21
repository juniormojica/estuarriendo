import type { Metadata } from 'next';
import PropertyDetailClient from '@/views/PropertyDetail';
import ClientOnly from '@/components/ClientOnly';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${resolvedParams.id}`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      return { title: 'Propiedad no encontrada' };
    }

    const property = await res.json();

    return {
      title: property.title || 'Detalle de Propiedad',
      description: property.description?.substring(0, 160),
      openGraph: {
        title: property.title,
        description: property.description?.substring(0, 160),
        images: property.images?.[0]?.url ? [{ url: property.images[0].url }] : [],
        type: 'article',
      },
    };
  } catch (e) {
    return { title: 'Propiedad' };
  }
}

export default function PropertyPage() {
  return <ClientOnly><PropertyDetailClient /></ClientOnly>;
}
