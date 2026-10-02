import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Mail, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BetaInfoModal({ isOpen, onClose, type = 'beta', errorDetails = '' }) {
  if (!isOpen) return null;

  const emailDestino = 'folivaresferraez@gmail.com';
  const asunto = encodeURIComponent('Reporte de Error / Mejora - WorkTime HR (Beta)');
  const cuerpo = encodeURIComponent(
    `Hola Francisco,\n\nEncontré el siguiente detalle / error mientras usaba la app:\n\n${errorDetails}\n\nComentarios adicionales:`
  );

  const mailtoLink = `mailto:${emailDestino}?subject=${asunto}&body=${cuerpo}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-violet-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl shadow-violet-950/50 flex flex-col items-center relative overflow-hidden"
        >
          {/* Brillos ambientales */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Encabezado */}
          <div className="flex items-center justify-between w-full mb-4 border-b border-violet-500/20 pb-3">
            <div className="flex items-center gap-2 text-cyan-400">
              {type === 'beta' ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
              <span className="font-bold text-sm text-white tracking-wide">
                {type === 'beta' ? 'Aviso de Versión Beta' : 'Incidencia Detectada'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido Dinámico */}
          {type === 'beta' ? (
            <div className="text-center space-y-3 my-2">
              <div className="inline-flex p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-cyan-400 mb-1">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">¡Bienvenido a WorkTime HR!</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Te informamos que la aplicación se encuentra actualmente en <span className="text-cyan-400 font-semibold">fase Beta</span>. 
                Puede contener pequeños detalles o errores de comportamiento. Agradecemos enormemente tus comentarios, sugerencias 
                o reportes de mejora para seguir optimizándola.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-3 my-2">
              <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 mb-1">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">¡Ups, algo no salió como esperábamos!</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Ha ocurrido un detalle técnico en la aplicación. No te preocupes, el error ha sido registrado de forma interna en la terminal. 
                Puedes reportarlo directamente al desarrollador para solucionarlo a la brevedad.
              </p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="w-full space-y-2.5 mt-6">
            {type === 'error' && (
              <a
                href={mailtoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-xs cursor-pointer"
              >
                <Mail className="w-4 h-4" /> Reportar error a Francisco Olivares
              </a>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs border border-slate-700"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {type === 'beta' ? 'Entendido, continuar' : 'Cerrar ventana'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}