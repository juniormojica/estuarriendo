import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PropertyDetail from './pages/PropertyDetail';
import PropertySubmission from './pages/PropertySubmission';
import AdminDashboard from './pages/AdminDashboard';
import FavoritesPage from './pages/FavoritesPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OwnerDashboard from './pages/OwnerDashboard';
import UserProfile from './pages/UserProfile';
import StudentRequestPage from './pages/StudentRequestPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import PlansPage from './pages/PlansPage';
import { FavoritesProvider } from './context/FavoritesContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Provider store={store}>
      <FavoritesProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-50">
            <Header />
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

              {/* Protected routes - require authentication */}
              <Route
                path="/publicar"
                element={
                  <ProtectedRoute>
                    <PropertySubmission />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editar-propiedad/:id"
                element={
                  <ProtectedRoute>
                    <PropertySubmission />
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
                path="/busco-inmueble"
                element={
                  <ProtectedRoute>
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
                path="/admin"
                element={
                  <ProtectedRoute allowedUserTypes={['admin', 'superAdmin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Footer />
          </div>
        </Router>
      </FavoritesProvider>
    </Provider>
  );
}

export default App;
