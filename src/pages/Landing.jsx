import { motion } from 'framer-motion';
import { ShieldCheck, Clock, LogIn } from 'lucide-react';

export default function Landing({ onRequestAuth }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-violet-500/10 text-cyan-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-4 border border-cyan-500/20 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Privado • Datos guardados exclusivamente en tu Google Drive
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 tracking-tight mb-4">
          WorkTime <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">HR</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-light">
          Esta aplicación fue creada con el fin de llevar un control más fácil, preciso y eficaz de nuestras horas trabajadas, permitiendo checar y verificar exactamente cuánto tiempo laboramos día a día. Al operar de forma libre y segura mediante la API de Google, tus datos están respaldados directamente en tu propia nube; la app actúa únicamente como una interfaz limpia y accesible para facilitar la gestión de tu jornada laboral.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/60 border border-violet-500/20 rounded-3xl p-8 text-center backdrop-blur-xl max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        <Clock className="w-14 h-14 text-cyan-400 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">Conecta tu cuenta de Google</h2>
        <p className="text-slate-400 text-sm mb-6 font-light">
          Crearemos automáticamente tu hoja de cálculo personal para registrar y sincronizar tus turnos de manera segura.
        </p>
        <button
          onClick={onRequestAuth}
          className="w-full bg-gradient-to-r from-cyan-500 via-violet-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer text-sm"
        >
          <LogIn className="w-5 h-5" /> Conectar con Google
        </button>
      </motion.div>
    </div>
  );
}