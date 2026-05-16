'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Menu, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { api } from '../services/api';
import NotificationBell from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import { CreditBalance } from '../types';

// ---------------------------------------------------------------------------
// NavLink moved OUTSIDE Header so React can reconcile it consistently between
// SSR and client renders. Defining components inside another component causes
// the reconciler to treat them as new element types on every render, which is
// one of the root causes of hydration mismatches.
// ---------------------------------------------------------------------------
interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  badge?: number;
  mobile?: boolean;
  pathname: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, badge, mobile = false, pathname }) => {
  const isActive = pathname === to;

  if (mobile) {
    return (
      <Link
        href={to}
        className={`relative flex items-center justify-between w-full px-4 py-3.5 rounded-lg text-base font-jakarta font-medium transition-all ${isActive
          ? 'bg-brand-blue/5 text-brand-blue border-l-4 border-brand-blue'
          : 'text-gray-700 hover:text-brand-blue hover:bg-gray-50 active:bg-gray-100'
          }`}
      >
        <span>{children}</span>
        {badge !== undefined && badge > 0 && (
          <span className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-brand-lime text-brand-dark text-xs font-bold rounded-full">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={to}
      className={`relative px-4 py-2.5 rounded-lg text-sm font-jakarta font-medium transition-all ${isActive
        ? 'bg-brand-blue/5 text-brand-blue'
        : 'text-gray-700 hover:text-brand-blue hover:bg-gray-50 active:bg-gray-100'
        }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-brand-lime text-brand-dark text-xs font-bold rounded-full">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
};

// ---------------------------------------------------------------------------

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [newOpportunitiesCount, setNewOpportunitiesCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tenantCredits, setTenantCredits] = useState<CreditBalance | null>(null);

  // ---------------------------------------------------------------------------
  // `mounted` prevents rendering auth-dependent content on the server.
  // The server always sees currentUser as null (no Redux/localStorage), so any
  // JSX branch that depends on currentUser MUST be deferred to the client to
  // avoid a server/client HTML mismatch (hydration error).
  // ---------------------------------------------------------------------------
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

    const loadTenantCredits = async () => {
      if (currentUser?.userType === 'tenant') {
        try {
          // Add a small delay so other requests take priority or balance is fully synced
          const balance = await api.getCreditBalance(currentUser.id.toString());
          setTenantCredits(balance);
        } catch (error) {
          console.error('Error loading tenant credits:', error);
        }
      }
    };

    loadNewOpportunitiesCount();
    loadTenantCredits();
  }, [currentUser]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="EstuArriendo"
              width={160}
              height={40}
              className="h-9 sm:h-11 w-auto dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.svg"
              alt="EstuArriendo"
              width={160}
              height={40}
              className="h-9 sm:h-11 w-auto hidden dark:block"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink to="/" pathname={pathname}>Inicio</NavLink>

            {/* Auth-dependent links — only rendered after client mount to avoid hydration mismatch */}
            {mounted && (
              <>
                {/* Hide Favoritos and Planes for admin/super_admin users */}
                {(!currentUser || (currentUser.userType !== 'admin' && currentUser.userType !== 'super_admin')) && (
                  <>
                    <NavLink to="/favoritos" pathname={pathname}>Favoritos</NavLink>
                    <NavLink to="/planes" pathname={pathname}>Planes</NavLink>
                  </>
                )}

                {currentUser && (
                  <>
                    {/* Admin Panel Link */}
                    {(currentUser.userType === 'admin' || currentUser.userType === 'super_admin') && (
                      <NavLink to="/admin" pathname={pathname}>Admin Panel</NavLink>
                    )}

                    {/* Super Admin Dashboard Link */}
                    {currentUser.userType === 'super_admin' && (
                      <NavLink to="/super-admin" pathname={pathname}>Super Admin</NavLink>
                    )}

                    {/* Tenant Links */}
                    {currentUser.userType === 'tenant' && (
                      <NavLink to="/busco-inmueble" pathname={pathname}>Busco Inmueble</NavLink>
                    )}

                    {/* Owner Links */}
                    {currentUser.userType === 'owner' && (
                      <>
                        <NavLink to="/oportunidades" badge={newOpportunitiesCount} pathname={pathname}>
                          Solicitudes
                        </NavLink>
                        <NavLink to="/mis-propiedades" pathname={pathname}>Mis Propiedades</NavLink>
                      </>
                    )}

                    <NavLink to="/perfil" pathname={pathname}>Mi Perfil</NavLink>
                  </>
                )}

                {/* Publicar Button — only shown when not logged in or when owner */}
                {(!currentUser || currentUser.userType === 'owner') && (
                  <Link
                    href="/publicar"
                    className="flex items-center space-x-1.5 px-5 py-2.5 rounded-full text-sm font-jakarta font-bold text-white bg-brand-blue shadow-md hover:shadow-lg hover:bg-brand-blue/90 transform hover:-translate-y-0.5 transition-all duration-200 ml-2"
                  >
                    <Plus className="h-4 w-4 text-brand-lime" />
                    <span>Publicar</span>
                  </Link>
                )}
              </>
            )}

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            <ThemeToggle />

            {/* Notification Bell */}
            {mounted && currentUser && <NotificationBell />}

            {/* Auth Section */}
            {mounted && (
              currentUser ? (
                <div className="flex items-center space-x-3 ml-2">
                  {currentUser.userType === 'tenant' && tenantCredits && (
                    <button
                      onClick={() => router.push('/perfil?tab=billing')}
                      className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer border border-emerald-200"
                      title="Balance de Créditos"
                    >
                      <span className="font-bold mr-1.5 text-emerald-600">🟡</span>
                      <span className="text-sm font-semibold">
                        {tenantCredits.hasUnlimited && tenantCredits.unlimitedUntil && new Date(tenantCredits.unlimitedUntil) > new Date()
                          ? 'Ilimitados'
                          : `${tenantCredits.availableCredits} Créditos`}
                      </span>
                    </button>
                  )}

                  <span
                    onClick={() => router.push('/perfil')}
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
                    href="/login"
                    className="text-gray-700 hover:text-brand-blue font-jakarta px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-brand-blue text-white hover:bg-brand-blue/90 font-jakarta px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-all"
                  >
                    Registrarse
                  </Link>
                </div>
              )
            )}
          </nav>

          {/* Mobile Right Section - Properly aligned */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {/* Notification Bell - Mobile */}
            {mounted && currentUser && <NotificationBell />}

            {/* Publicar Button - Mobile (Icon Only) */}
            {mounted && (!currentUser || currentUser.userType === 'owner') && (
              <Link
                href="/publicar"
                className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 rounded-full text-brand-lime bg-brand-blue shadow-md active:scale-95 transition-transform"
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
          {mounted && currentUser && (
            <div className="p-6 bg-brand-blue/5 border-b border-gray-200">
              <p className="text-xs text-brand-blue uppercase tracking-wide font-jakarta font-bold">Hola,</p>
              <p className="text-xl font-bold text-gray-900 mt-1 font-jakarta">{currentUser.name}</p>
              <div className="flex flex-col mt-2 space-y-2">
                <p className="text-sm text-gray-600 inline-block w-max px-3 py-1 bg-white/60 rounded-full">
                  {currentUser.userType === 'owner' ? 'Propietario' :
                    currentUser.userType === 'tenant' ? 'Estudiante' :
                      currentUser.userType === 'admin' ? 'Administrador' : 'Super Admin'}
                </p>
                {currentUser.userType === 'tenant' && tenantCredits && (
                  <button
                    onClick={() => {
                      router.push('/perfil?tab=billing');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-max bg-white/80 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                  >
                    <span className="font-bold mr-1.5 text-emerald-600">🟡</span>
                    <span className="text-sm font-semibold">
                      {tenantCredits.hasUnlimited && tenantCredits.unlimitedUntil && new Date(tenantCredits.unlimitedUntil) > new Date()
                        ? 'Ilimitados'
                        : `${tenantCredits.availableCredits} Créditos`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 py-6 px-4">
            <div className="space-y-2">
              <NavLink to="/" mobile pathname={pathname}>Inicio</NavLink>

              {mounted && (
                <>
                  {(!currentUser || (currentUser.userType !== 'admin' && currentUser.userType !== 'super_admin')) && (
                    <>
                      <NavLink to="/favoritos" mobile pathname={pathname}>Favoritos</NavLink>
                      <NavLink to="/planes" mobile pathname={pathname}>Planes</NavLink>
                    </>
                  )}

                  {currentUser && (
                    <>
                      {/* Divider for user-specific sections */}
                      {(currentUser.userType === 'admin' || currentUser.userType === 'super_admin' ||
                        currentUser.userType === 'tenant' || currentUser.userType === 'owner') && (
                          <div className="py-2">
                            <div className="h-px bg-gray-200"></div>
                          </div>
                        )}

                      {(currentUser.userType === 'admin' || currentUser.userType === 'super_admin') && (
                        <NavLink to="/admin" mobile pathname={pathname}>Admin Panel</NavLink>
                      )}

                      {currentUser.userType === 'super_admin' && (
                        <NavLink to="/super-admin" mobile pathname={pathname}>Super Admin</NavLink>
                      )}

                      {currentUser.userType === 'tenant' && (
                        <NavLink to="/busco-inmueble" mobile pathname={pathname}>Busco Inmueble</NavLink>
                      )}

                      {currentUser.userType === 'owner' && (
                        <>
                          <NavLink to="/oportunidades" badge={newOpportunitiesCount} mobile pathname={pathname}>
                            Solicitudes
                          </NavLink>
                          <NavLink to="/mis-propiedades" mobile pathname={pathname}>Mis Propiedades</NavLink>
                        </>
                      )}

                      {/* Divider before profile */}
                      <div className="py-2">
                        <div className="h-px bg-gray-200"></div>
                      </div>

                      <NavLink to="/perfil" mobile pathname={pathname}>Mi Perfil</NavLink>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Auth Section - Mobile */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {mounted && (
              currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3.5 text-base font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border-2 border-red-200 rounded-xl transition-all active:scale-98 shadow-sm"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <div className="space-y-3 font-jakarta">
                  <Link
                    href="/login"
                    className="block w-full px-4 py-3.5 text-center text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl transition-all shadow-sm"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/registro"
                    className="block w-full px-4 py-3.5 text-center text-base font-semibold text-brand-dark bg-brand-lime hover:bg-brand-lime/90 rounded-xl shadow-md transition-all"
                  >
                    Registrarse
                  </Link>
                </div>
              )
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;