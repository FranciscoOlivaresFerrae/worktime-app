import { ShieldCheck, Info, Mail, Sparkles, Code2, User } from 'lucide-react';

export default function InfoGeneral() {
  const emailDestino = 'folivaresferraez@gmail.com';
  const asuntoSugerencia = encodeURIComponent('Sugerencia / Mejora - WorkTime HR');
  const cuerpoSugerencia = encodeURIComponent(
    'Hola Francisco,\n\nTengo la siguiente sugerencia o comentario para mejorar WorkTime HR:\n\n'
  );

  const mailtoSugerenciaLink = `mailto:${emailDestino}?subject=${asuntoSugerencia}&body=${cuerpoSugerencia}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tarjeta Principal de Información */}
      <div className="bg-slate-900/60 border border-violet-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-2xl relative overflow-hidden">
        {/* Brillo ambiental */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 border-b border-violet-500/20 pb-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-cyan-400">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Información General</h2>
            <p className="text-xs text-slate-400 font-light">Acerca de la arquitectura y el desarrollo de WorkTime HR</p>
          </div>
        </div>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
          <strong className="text-white font-medium">WorkTime HR</strong> es una PWA (Progressive Web App) ligera y modular construida bajo un modelo privado e independiente. 
          Está diseñada con un enfoque estricto mobile-first y una interfaz <span className="text-cyan-400 font-medium">Cyber Dark / Deep Violet</span>, 
          priorizando la privacidad total del usuario al no requerir servidores intermediarios ni bases de datos de terceros.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/60 border border-violet-500/20 rounded-2xl flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Privacidad Absoluta</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Tus registros de entrada y salida se guardan exclusivamente dentro de tu propia cuenta personal de Google Drive mediante autenticación segura OAuth 2.0.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-violet-500/20 rounded-2xl flex items-start gap-3.5">
            <Sparkles className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Fase Beta Activa</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                La aplicación se encuentra en constante evolución. Cualquier comentario, reporte o ajuste ayuda a mejorar la experiencia diaria.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de Desarrollador y Sugerencias */}
      <div className="bg-gradient-to-br from-slate-900/80 to-violet-950/40 border border-violet-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 text-center sm:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-cyan-400 text-xs font-medium">
            <Code2 className="w-3.5 h-3.5" /> Desarrollador Independiente
          </div>
          <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <User className="w-5 h-5 text-violet-400" /> Francisco Antonio Olivares Ferraez
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-light leading-relaxed">
            Aplicación desarrollada de manera independiente. Si tienes sugerencias de cambios, nuevas características o comentarios para implementar, 
            puedes enviarme un correo directamente. ¡Tus aportaciones son siempre bienvenidas!
          </p>
        </div>

        <div className="w-full sm:w-auto flex-shrink-0 z-10">
          <a
            href={mailtoSugerenciaLink}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/50 transition-all text-xs cursor-pointer"
          >
            <Mail className="w-4 h-4" /> Enviar Sugerencia o Comentario
          </a>
        </div>
      </div>
    </div>
  );
}