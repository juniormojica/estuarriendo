'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Mail, Phone, MapPin, Heart, CheckCircle, ShieldCheck, Lock, DollarSign } from 'lucide-react';
import { FacebookIcon, InstagramIcon, XIcon } from './icons/SocialIcons'

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-brand-dark text-gray-300 font-lato border-t-[8px] border-brand-lime">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                    {/* About Section */}
                    <div>
                        <div className="mb-6">
                            <Image
                                src="/logo-dark.svg"
                                alt="EstuArriendo"
                                width={160}
                                height={40}
                                className="h-10 w-auto"
                            />
                        </div>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                            Tu plataforma confiable para encontrar alojamiento estudiantil en América Latina.
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
                                <FacebookIcon className="h-5 w-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-emerald-500 transition-colors"
                                aria-label="Instagram"
                            >
                                <InstagramIcon className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-emerald-500 transition-colors"
                                aria-label="Twitter"
                            >
                                <XIcon className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-brand-lime font-jakarta font-bold text-lg mb-5">Enlaces Rápidos</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/" className="hover:text-emerald-500 transition-colors">
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link href="/publicar" className="hover:text-emerald-500 transition-colors">
                                    Publicar Propiedad
                                </Link>
                            </li>
                            <li>
                                <Link href="/favoritos" className="hover:text-emerald-500 transition-colors">
                                    Mis Favoritos
                                </Link>
                            </li>
                            <li>
                                <Link href="/sobre-nosotros" className="hover:text-emerald-500 transition-colors">
                                    Sobre Nosotros
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Students */}
                    <div>
                        <h3 className="text-brand-lime font-jakarta font-bold text-lg mb-5">Para Estudiantes</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/planes" className="hover:text-white hover:underline transition-all">
                                    Nuestros Planes
                                </Link>
                            </li>
                            <li>
                                <Link href="/como-buscar" className="hover:text-emerald-500 transition-colors">
                                    Cómo Buscar Alojamiento
                                </Link>
                            </li>
                            <li>
                                <Link href="/consejos-seguridad" className="hover:text-emerald-500 transition-colors">
                                    Consejos de Seguridad
                                </Link>
                            </li>
                            <li>
                                <Link href="/preguntas-frecuentes" className="hover:text-emerald-500 transition-colors">
                                    Preguntas Frecuentes
                                </Link>
                            </li>
                            <li>
                                <Link href="/terminos" className="hover:text-emerald-500 transition-colors">
                                    Términos y Condiciones
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-brand-lime font-jakarta font-bold text-lg mb-5">Contacto</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-brand-lime flex-shrink-0 mt-0.5" />
                                <span>Valledupar, Cesar, Colombia</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Mail className="h-5 w-5 text-brand-lime flex-shrink-0 mt-0.5" />
                                <a href="mailto:estuarriendo@gmail.com" className="hover:text-white transition-colors">
                                    estuarriendo@gmail.com
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="h-5 w-5 text-brand-lime flex-shrink-0 mt-0.5" />
                                <a href="tel:+573058136982" className="hover:text-white transition-colors">
                                    +57 305 813 6982
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
                            <Link href="/privacidad" className="hover:text-emerald-500 transition-colors">
                                Política de Privacidad
                            </Link>
                            <span className="text-gray-600">•</span>
                            <Link href="/terminos" className="hover:text-emerald-500 transition-colors">
                                Términos de Uso
                            </Link>
                            <span className="text-gray-600">•</span>
                            <Link href="/cookies" className="hover:text-emerald-500 transition-colors">
                                Política de Cookies
                            </Link>
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
            <div className="bg-[#0B1529] py-5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-400 font-jakarta">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-brand-lime" />
                            <span>Propiedades Verificadas</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <ShieldCheck className="h-4 w-4 text-brand-lime" />
                            <span>Soporte 24/7</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Lock className="h-4 w-4 text-brand-lime" />
                            <span>100% Seguro</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-brand-lime" />
                            <span>Transparencia Financiera</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
