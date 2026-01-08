import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Heart } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {/* About Section */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Home className="h-6 w-6 text-emerald-500" />
                            <h3 className="text-white font-bold text-lg">EstuArriendo</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Tu plataforma confiable para encontrar alojamiento estudiantil en Valledupar.
                            Conectamos estudiantes con propiedades verificadas cerca de las universidades.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-emerald-500 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-emerald-500 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-emerald-500 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Enlaces Rápidos</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="hover:text-emerald-500 transition-colors">
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link to="/publicar" className="hover:text-emerald-500 transition-colors">
                                    Publicar Propiedad
                                </Link>
                            </li>
                            <li>
                                <Link to="/favoritos" className="hover:text-emerald-500 transition-colors">
                                    Mis Favoritos
                                </Link>
                            </li>
                            <li>
                                <a href="#sobre-nosotros" className="hover:text-emerald-500 transition-colors">
                                    Sobre Nosotros
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* For Students */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Para Estudiantes</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#como-buscar" className="hover:text-emerald-500 transition-colors">
                                    Cómo Buscar Alojamiento
                                </a>
                            </li>
                            <li>
                                <a href="#consejos" className="hover:text-emerald-500 transition-colors">
                                    Consejos de Seguridad
                                </a>
                            </li>
                            <li>
                                <a href="#preguntas" className="hover:text-emerald-500 transition-colors">
                                    Preguntas Frecuentes
                                </a>
                            </li>
                            <li>
                                <a href="#terminos" className="hover:text-emerald-500 transition-colors">
                                    Términos y Condiciones
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contacto</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>Valledupar, Cesar, Colombia</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Mail className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <a href="mailto:info@estuarriendo.com" className="hover:text-emerald-500 transition-colors">
                                    info@estuarriendo.com
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <a href="tel:+573000000000" className="hover:text-emerald-500 transition-colors">
                                    +57 300 000 0000
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 gap-4">
                        {/* Copyright */}
                        <p className="text-sm text-gray-400">
                            © {currentYear} EstuArriendo. Todos los derechos reservados.
                        </p>

                        {/* Legal Links */}
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <a href="#privacidad" className="hover:text-emerald-500 transition-colors">
                                Política de Privacidad
                            </a>
                            <span className="text-gray-600">•</span>
                            <a href="#terminos" className="hover:text-emerald-500 transition-colors">
                                Términos de Uso
                            </a>
                            <span className="text-gray-600">•</span>
                            <a href="#cookies" className="hover:text-emerald-500 transition-colors">
                                Política de Cookies
                            </a>
                        </div>

                        {/* Made with love */}
                        <p className="text-sm text-gray-400 flex items-center space-x-1">
                            <span>Hecho con</span>
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                            <span>para estudiantes</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-gray-950 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            <span>Propiedades Verificadas</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            <span>Soporte 24/7</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            <span>100% Seguro</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            <span>Sin Comisiones Ocultas</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
