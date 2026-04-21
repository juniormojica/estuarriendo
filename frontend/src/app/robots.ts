import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://estuarriendo.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/super-admin',
          '/dashboard',
          '/perfil',
          '/mi-perfil',
          '/mis-propiedades',
          '/publicar',
          '/editar-propiedad/',
          '/busco-inmueble',
          '/oportunidades',
          '/payment-success',
          '/favoritos',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
