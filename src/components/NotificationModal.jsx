import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function NotificationModal({ isOpen, onClose, title, message, type = 'success' }) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle2 className="w-8 h-8 text-emerald-400" />,
    warning: <AlertTriangle className="w-8 h-8 text-amber-400" />,
    error: <XCircle className="w-8 h-8 text-rose-400" />,
  };

  const borders = {
    success: 'border-emerald-500/20 bg-emerald-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    error: 'border-rose-500/20 bg-rose-500/5',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full max-w-md bg-slate-900 border ${borders[type]} rounded-2xl p-6 shadow-2xl space-y-4`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            {icons[type]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer border border-slate-700/60"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}