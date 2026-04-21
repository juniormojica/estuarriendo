import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-lg">
        {/* Large 404 */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-extrabold text-emerald-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 text-emerald-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Página no encontrada
        </h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          La página que buscas no existe, fue movida o la URL tiene un error.
          <br />
          Verifica la dirección o vuelve al inicio.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
          <Link
            href="/#propiedades"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            Buscar propiedades
          </Link>
        </div>
      </div>
    </div>
  );
}
