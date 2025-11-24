import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PropertyDetail from './pages/PropertyDetail';
import PropertySubmission from './pages/PropertySubmission';
import AdminDashboard from './pages/AdminDashboard';
import FavoritesPage from './pages/FavoritesPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import OwnerDashboard from './pages/OwnerDashboard';
import { FavoritesProvider } from './context/FavoritesContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <FavoritesProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/propiedad/:id" element={<PropertyDetail />} />
            <Route path="/favoritos" element={<FavoritesPage />} />
            <Route path="/publicar" element={<PropertySubmission />} />
            <Route path="/editar-propiedad/:id" element={<PropertySubmission />} />
            <Route path="/registro" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/mis-propiedades" element={<OwnerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </FavoritesProvider>
  );
}

export default App;