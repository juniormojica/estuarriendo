import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Menu, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { api } from '../services/api';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [newOpportunitiesCount, setNewOpportunitiesCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadNewOpportunitiesCount = async () => {
      if (currentUser?.userType === 'owner') {
        try {
          const requests = await api.getStudentRequests();
          const lastViewed = localStorage.getItem(`estuarriendo_opportunities_last_viewed_${currentUser.id}`);
          const lastViewedTimestamp = lastViewed ? parseInt(lastViewed) : 0;

          const newCount = requests.filter(request => {
            const requestTime = new Date(request.createdAt).getTime();
            return requestTime > lastViewedTimestamp;
          }).length;

          setNewOpportunitiesCount(newCount);
        } catch (error) {
          console.error('Error loading opportunities count:', error);
          setNewOpportunitiesCount(0);
        }
      }
    };

    loadNewOpportunitiesCount();
  }, [currentUser]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const NavLink = ({ to, children, badge, mobile = false }: { to: string; children: React.ReactNode; badge?: number; mobile?: boolean }) => {
    const isActive = location.pathname === to;

    if (mobile) {
      return (
        <Link
          to={to}
          className={`relative flex items-center justify-between w-full px-4 py-3.5 rounded-lg text-base font-medium transition-all ${isActive
            ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
            }`}
        >
          <span>{children}</span>
          {badge !== undefined && badge > 0 && (
            <span className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-red-500 text-white text-xs font-bold rounded-full">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </Link>
      );
    }

    return (
      <Link
        to={to}
        className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
          ? 'bg-emerald-50 text-emerald-700'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
          }`}
      >
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img src="/logo.svg" alt="EstuArriendo" className="h-8 sm:h-10" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink to="/">Inicio</NavLink>

            {/* Hide Favoritos and Planes for admin/superAdmin users */}
            {(!currentUser || (currentUser.userType !== 'admin' && currentUser.userType !== 'superAdmin')) && (
              <>
                <NavLink to="/favoritos">Favoritos</NavLink>
                <NavLink to="/planes">Planes</NavLink>
              </>
            )}

            {currentUser && (
              <>
                {/* Admin Panel Link */}
                {(currentUser.userType === 'admin' || currentUser.userType === 'superAdmin') && (
                  <NavLink to="/admin">Admin Panel</NavLink>
                )}

                {/* Super Admin Dashboard Link */}
                {currentUser.userType === 'superAdmin' && (
                  <NavLink to="/super-admin">Super Admin</NavLink>
                )}

                {/* Tenant Links */}
                {currentUser.userType === 'tenant' && (
                  <NavLink to="/busco-inmueble">Busco Inmueble</NavLink>
                )}

                {/* Owner Links */}
                {currentUser.userType === 'owner' && (
                  <>
                    <NavLink to="/oportunidades" badge={newOpportunitiesCount}>
                      Solicitudes
                    </NavLink>
                    <NavLink to="/mis-propiedades">Mis Propiedades</NavLink>
                  </>
                )}

                <NavLink to="/perfil">Mi Perfil</NavLink>
              </>
            )}

            {/* Publicar Button */}
            {(!currentUser || currentUser.userType === 'owner') && (
              <Link
                to="/publicar"
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ml-2"
              >
                <Plus className="h-4 w-4" />
                <span>Publicar</span>
              </Link>
            )}

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            {/* Notification Bell */}
            {currentUser && <NotificationBell />}

            {/* Auth Section */}
            {currentUser ? (
              <div className="flex items-center space-x-3 ml-2">
                <span
                  onClick={() => navigate('/perfil')}
                  className="text-sm text-gray-700 font-medium hover:text-gray-900 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hola, {currentUser.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Right Section - Properly aligned */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Notification Bell - Mobile */}
            {currentUser && <NotificationBell />}

            {/* Publicar Button - Mobile (Icon Only) */}
            {(!currentUser || currentUser.userType === 'owner') && (
              <Link
                to="/publicar"
                className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 rounded-full text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md active:scale-95 transition-transform"
                aria-label="Publicar propiedad"
              >
                <Plus className="h-5 w-5" />
              </Link>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] p-2 rounded-lg text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <nav className="flex flex-col h-full overflow-y-auto">
          {/* User Info Section */}
          {currentUser && (
            <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-b border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Hola,</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{currentUser.name}</p>
              <p className="text-sm text-gray-600 mt-1.5 inline-block px-3 py-1 bg-white/60 rounded-full">
                {currentUser.userType === 'owner' ? 'Propietario' :
                  currentUser.userType === 'tenant' ? 'Estudiante' :
                    currentUser.userType === 'admin' ? 'Administrador' : 'Super Admin'}
              </p>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 py-6 px-4">
            <div className="space-y-2">
              <NavLink to="/" mobile>Inicio</NavLink>

              {(!currentUser || (currentUser.userType !== 'admin' && currentUser.userType !== 'superAdmin')) && (
                <>
                  <NavLink to="/favoritos" mobile>Favoritos</NavLink>
                  <NavLink to="/planes" mobile>Planes</NavLink>
                </>
              )}

              {currentUser && (
                <>
                  {/* Divider for user-specific sections */}
                  {(currentUser.userType === 'admin' || currentUser.userType === 'superAdmin' ||
                    currentUser.userType === 'tenant' || currentUser.userType === 'owner') && (
                      <div className="py-2">
                        <div className="h-px bg-gray-200"></div>
                      </div>
                    )}

                  {(currentUser.userType === 'admin' || currentUser.userType === 'superAdmin') && (
                    <NavLink to="/admin" mobile>Admin Panel</NavLink>
                  )}

                  {currentUser.userType === 'superAdmin' && (
                    <NavLink to="/super-admin" mobile>Super Admin</NavLink>
                  )}

                  {currentUser.userType === 'tenant' && (
                    <NavLink to="/busco-inmueble" mobile>Busco Inmueble</NavLink>
                  )}

                  {currentUser.userType === 'owner' && (
                    <>
                      <NavLink to="/oportunidades" badge={newOpportunitiesCount} mobile>
                        Solicitudes
                      </NavLink>
                      <NavLink to="/mis-propiedades" mobile>Mis Propiedades</NavLink>
                    </>
                  )}

                  {/* Divider before profile */}
                  <div className="py-2">
                    <div className="h-px bg-gray-200"></div>
                  </div>

                  <NavLink to="/perfil" mobile>Mi Perfil</NavLink>
                </>
              )}
            </div>
          </div>

          {/* Auth Section - Mobile */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3.5 text-base font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border-2 border-red-200 rounded-xl transition-all active:scale-98 shadow-sm"
              >
                Cerrar Sesión
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full px-4 py-3.5 text-center text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl transition-all shadow-sm"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className="block w-full px-4 py-3.5 text-center text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md transition-all"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;