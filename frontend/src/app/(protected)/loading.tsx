export default function ProtectedLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div
          className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"
          role="status"
          aria-label="Cargando panel"
        />
        <p className="text-gray-500 text-sm font-medium">Cargando panel...</p>
      </div>
    </div>
  );
}
