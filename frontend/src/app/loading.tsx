export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"
          role="status"
          aria-label="Cargando"
        />
        <p className="text-gray-500 text-sm font-medium">Cargando...</p>
      </div>
    </div>
  );
}
