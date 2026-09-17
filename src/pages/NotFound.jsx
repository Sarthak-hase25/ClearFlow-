import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 text-blue-500 flex items-center justify-center mb-6 shadow-lg">
        <Building2 className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
        Error 404
      </span>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-gray-500 max-w-md mb-8">
        The page you are looking for does not exist or may have been relocated in the ArchFlow project workspace.
      </p>

      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <button onClick={() => navigate('/')} className="btn-primary">
          <Home className="w-4 h-4" /> Dashboard
        </button>
      </div>
    </div>
  );
}
