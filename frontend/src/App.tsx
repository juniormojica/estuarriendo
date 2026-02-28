import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { getCurrentUser } from './store/slices/authSlice';
import authService from './services/authService';
import Header from './components/Header';
import Footer from './components/Footer';
import { FavoritesProvider } from './context/FavoritesContext';
import { ToastProvider } from './components/ToastProvider';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import PageLoadingFallback from './components/PageLoadingFallback';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const PropertySubmissionRouter = lazy(() => import('./pages/PropertySubmissionRouter'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const StudentRequestPage = lazy(() => import('./pages/StudentRequestPage'));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const ComponentDemoPage = lazy(() => import('./pages/ComponentDemoPage'));

// Informational pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const HowToSearchPage = lazy(() => import('./pages/HowToSearchPage'));
const SecurityTipsPage = lazy(() => import('./pages/SecurityTipsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));

function AppContent() {
  useEffect(() => {
    // Initialize auth state if token exists
    const token = authService.getToken();
    if (token) {
      store.dispatch(getCurrentUser());
    }
  }, []);

  return (
    <Provider store={store}>
      <ToastProvider>
        <FavoritesProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-gray-50">
              <Header />
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/propiedad/:id" element={<PropertyDetail />} />
                  <Route path="/favoritos" element={<FavoritesPage />} />
                  <Route path="/planes" element={<PlansPage />} />
                  <Route path="/registro" element={<RegistrationPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Informational routes */}
                  <Route path="/sobre-nosotros" element={<AboutPage />} />
                  <Route path="/como-buscar" element={<HowToSearchPage />} />
                  <Route path="/consejos-seguridad" element={<SecurityTipsPage />} />
                  <Route path="/preguntas-frecuentes" element={<FAQPage />} />
                  <Route path="/terminos" element={<TermsPage />} />
                  <Route path="/privacidad" element={<PrivacyPage />} />
                  <Route path="/cookies" element={<CookiesPage />} />

                  {/* Demo route - temporary for development */}
                  <Route path="/demo-components" element={<ComponentDemoPage />} />

                  {/* Protected routes - require authentication */}
                  <Route
                    path="/publicar"
                    element={
                      <ProtectedRoute>
                        <PropertySubmissionRouter />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/editar-propiedad/:id"
                    element={
                      <ProtectedRoute>
                        <PropertySubmissionRouter />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedUserTypes={['owner']}>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mis-propiedades"
                    element={
                      <ProtectedRoute allowedUserTypes={['owner']}>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/perfil"
                    element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mi-perfil"
                    element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/busco-inmueble"
                    element={
                      <ProtectedRoute allowedUserTypes={['tenant']}>
                        <StudentRequestPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/oportunidades"
                    element={
                      <ProtectedRoute allowedUserTypes={['owner']}>
                        <OpportunitiesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/super-admin"
                    element={
                      <ProtectedRoute allowedUserTypes={['superAdmin']}>
                        <SuperAdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedUserTypes={['admin', 'superAdmin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
              <Footer />
            </div>
          </Router>
        </FavoritesProvider>
      </ToastProvider>
    </Provider>
  );
}

export default AppContent;
