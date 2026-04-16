const fs = require('fs');
const path = require('path');

const protectedPages = [
  { folder: '(protected)/publicar', component: 'PropertySubmissionRouter' },
  { folder: '(protected)/editar-propiedad/[id]', component: 'PropertySubmissionRouter' },
  { folder: '(protected)/dashboard', component: 'OwnerDashboard' },
  { folder: '(protected)/mis-propiedades', component: 'OwnerDashboard' },
  { folder: '(protected)/perfil', component: 'UserProfile' },
  { folder: '(protected)/mi-perfil', component: 'UserProfile' },
  { folder: '(protected)/busco-inmueble', component: 'StudentRequestPage' },
  { folder: '(protected)/payment-success', component: 'SuccessPaymentPage' },
  { folder: '(protected)/oportunidades', component: 'OpportunitiesPage' },
  { folder: '(protected)/admin', component: 'AdminDashboard' },
  { folder: 'super-admin', component: 'SuperAdminDashboard' }
];

const basePath = path.join(__dirname, 'src', 'app');

protectedPages.forEach(p => {
  const content = `'use client';
import ${p.component}Client from '@/pages/${p.component}';

export default function ${p.component}Route() {
  return <${p.component}Client />;
}
`;
  // ensure dir exists
  const fullPath = path.join(basePath, p.folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  fs.writeFileSync(path.join(fullPath, 'page.tsx'), content);
});

console.log('Protected pages generated successfully.');
