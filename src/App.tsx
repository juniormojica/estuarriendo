import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PropertyDetail from './pages/PropertyDetail';
import PropertySubmission from './pages/PropertySubmission';
import AdminDashboard from './pages/AdminDashboard';
import { FavoritesProvider } from './context/FavoritesContext';

function App() {
  return (
    <FavoritesProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/propiedad/:id" element={<PropertyDetail />} />
            <Route path="/publicar" element={<PropertySubmission />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </FavoritesProvider>
  );
}

export default App;