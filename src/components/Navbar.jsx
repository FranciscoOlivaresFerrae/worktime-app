import { Menu, CheckCircle2, CloudOff, RefreshCw } from 'lucide-react';

export default function Navbar({ onMenuClick, isOnline, onCheckConnection, loading }) {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-violet-500/20 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white hidden sm:block">
          Panel de Control
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Botón interactivo con estado de carga y bloqueo anti-spam de clics */}
        <button
          onClick={onCheckConnection}
          disabled={loading}
          title="Comprobar conexión y sincronizar con Drive"
          className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700/60 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
          <span className="hidden md:inline">
            {loading ? 'Comprobando...' : 'Comprobar Drive'}
          </span>
        </button>

        {/* Indicador de estado de red */}
        {isOnline ? (
          <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Drive Sincronizado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 font-medium">
            <CloudOff className="w-3.5 h-3.5" /> Modo Offline (Local)
          </span>
        )}
      </div>
    </header>
  );
}