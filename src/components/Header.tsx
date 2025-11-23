import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="EstuArriendo" className="h-10" />
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Inicio
            </Link>
            <Link
              to="/favoritos"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/favoritos'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Favoritos
            </Link>
            <Link
              to="/publicar"
              className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/publicar'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Plus className="h-4 w-4" />
              <span>Publicar</span>
            </Link>

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            {localStorage.getItem('estuarriendo_user') ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 font-medium">
                  Hola, {JSON.parse(localStorage.getItem('estuarriendo_user') || '{}').name?.split(' ')[0]}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('estuarriendo_user');
                    window.location.reload();
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;