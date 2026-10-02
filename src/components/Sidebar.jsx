import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  Table,
  FileSpreadsheet,
  Info,
  LogOut,
  X,
  Clock,
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen, activePage, setActivePage, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'registrar', label: 'Registrar Jornada', icon: PlusCircle },
    { id: 'historial', label: 'Historial & Filtros', icon: Table },
    { id: 'reportes', label: 'Reportes & Excel', icon: FileSpreadsheet },
    { id: 'info', label: 'Información General', icon: Info },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-950/95 border-r border-violet-500/20 backdrop-blur-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="p-5 flex items-center justify-between border-b border-violet-500/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                WorkTime <span className="text-cyan-400">HR</span>
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-violet-500/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}