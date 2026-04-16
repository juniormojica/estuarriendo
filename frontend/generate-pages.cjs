const fs = require('fs');
const path = require('path');

const pages = [
  { folder: 'sobre-nosotros', component: 'AboutPage', title: 'Sobre Nosotros' },
  { folder: 'como-buscar', component: 'HowToSearchPage', title: 'Cómo Buscar Inmueble' },
  { folder: 'consejos-seguridad', component: 'SecurityTipsPage', title: 'Consejos de Seguridad' },
  { folder: 'preguntas-frecuentes', component: 'FAQPage', title: 'Preguntas Frecuentes' },
  { folder: 'terminos', component: 'TermsPage', title: 'Términos y Condiciones' },
  { folder: 'privacidad', component: 'PrivacyPage', title: 'Política de Privacidad' },
  { folder: 'cookies', component: 'CookiesPage', title: 'Política de Cookies' },
  { folder: 'planes', component: 'PlansPage', title: 'Planes' }
];

const basePath = path.join(__dirname, 'src', 'app');

pages.forEach(p => {
  const content = `import type { Metadata } from 'next';
import ${p.component}Client from '@/pages/${p.component}';

export const metadata: Metadata = {
  title: '${p.title}',
};

export default function ${p.component}Route() {
  return <${p.component}Client />;
}
`;
  fs.writeFileSync(path.join(basePath, p.folder, 'page.tsx'), content);
});

// CSR routes
const dynamicPages = [
  { folder: 'favoritos', component: 'FavoritesPage' },
  { folder: 'registro', component: 'RegistrationPage' },
  { folder: 'login', component: 'LoginPage' },
  { folder: 'forgot-password', component: 'ForgotPasswordPage' },
  { folder: 'reset-password', component: 'ResetPasswordPage' }
];

dynamicPages.forEach(p => {
  const content = `import ${p.component}Client from '@/pages/${p.component}';

export default function ${p.component}Route() {
  return <${p.component}Client />;
}
`;
  fs.writeFileSync(path.join(basePath, p.folder, 'page.tsx'), content);
});

// Property Detail
const propContent = `import type { Metadata } from 'next';
import PropertyDetailClient from '@/pages/PropertyDetail';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/properties/\${resolvedParams.id}\`, {
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
  return <PropertyDetailClient />;
}
`;
fs.writeFileSync(path.join(basePath, 'propiedad', '[id]', 'page.tsx'), propContent);

console.log('Pages generated successfully.');
