import { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, CheckCircle2, Timer, Briefcase} from 'lucide-react';

// Lista oficial de catorcenas para alinear el Dashboard con el periodo de pago actual
const CATORCENAS_2026 = [
  { id: 1, inicio: '2026-01-01', fin: '2026-01-14', label: 'Catorcena 01 (01 Ene - 14 Ene)' },
  { id: 2, inicio: '2026-01-15', fin: '2026-01-28', label: 'Catorcena 02 (15 Ene - 28 Ene)' },
  { id: 3, inicio: '2026-01-29', fin: '2026-02-11', label: 'Catorcena 03 (29 Ene - 11 Feb)' },
  { id: 4, inicio: '2026-02-12', fin: '2026-02-25', label: 'Catorcena 04 (12 Feb - 25 Feb)' },
  { id: 5, inicio: '2026-02-26', fin: '2026-03-11', label: 'Catorcena 05 (26 Feb - 11 Mar)' },
  { id: 6, inicio: '2026-03-12', fin: '2026-03-25', label: 'Catorcena 06 (12 Mar - 25 Mar)' },
  { id: 7, inicio: '2026-03-26', fin: '2026-04-08', label: 'Catorcena 07 (26 Mar - 08 Abr)' },
  { id: 8, inicio: '2026-04-09', fin: '2026-04-22', label: 'Catorcena 08 (09 Abr - 22 Abr)' },
  { id: 9, inicio: '2026-04-23', fin: '2026-05-06', label: 'Catorcena 09 (23 Abr - 06 May)' },
  { id: 10, inicio: '2026-05-07', fin: '2026-05-20', label: 'Catorcena 10 (07 May - 20 May)' },
  { id: 11, inicio: '2026-05-21', fin: '2026-06-03', label: 'Catorcena 11 (21 May - 03 Jun)' },
  { id: 12, inicio: '2026-06-04', fin: '2026-06-17', label: 'Catorcena 12 (04 Jun - 17 Jun)' },
  { id: 13, inicio: '2026-06-18', fin: '2026-07-01', label: 'Catorcena 13 (18 Jun - 01 Jul)' },
  { id: 14, inicio: '2026-07-02', fin: '2026-07-15', label: 'Catorcena 14 (02 Jul - 15 Jul)' },
  { id: 15, inicio: '2026-07-16', fin: '2026-07-29', label: 'Catorcena 15 (16 Jul - 29 Jul)' },
  { id: 16, inicio: '2026-07-30', fin: '2026-08-12', label: 'Catorcena 16 (30 Jul - 12 Ago)' },
  { id: 17, inicio: '2026-08-13', fin: '2026-08-26', label: 'Catorcena 17 (13 Ago - 26 Ago)' },
  { id: 18, inicio: '2026-08-27', fin: '2026-09-09', label: 'Catorcena 18 (27 Ago - 09 Sep)' },
  { id: 19, inicio: '2026-09-10', fin: '2026-09-23', label: 'Catorcena 19 (10 Sep - 23 Sep)' },
  { id: 20, inicio: '2026-09-24', fin: '2026-10-07', label: 'Catorcena 20 (24 Sep - 07 Oct)' },
  { id: 21, inicio: '2026-10-08', fin: '2026-10-21', label: 'Catorcena 21 (08 Oct - 21 Oct)' },
  { id: 22, inicio: '2026-10-22', fin: '2026-11-04', label: 'Catorcena 22 (22 Oct - 04 Nov)' },
  { id: 23, inicio: '2026-11-05', fin: '2026-11-18', label: 'Catorcena 23 (05 Nov - 18 Nov)' },
  { id: 24, inicio: '2026-11-19', fin: '2026-12-02', label: 'Catorcena 24 (19 Nov - 02 Dic)' },
  { id: 25, inicio: '2026-12-03', fin: '2026-12-16', label: 'Catorcena 25 (03 Dic - 16 Dic)' },
  { id: 26, inicio: '2026-12-17', fin: '2026-12-31', label: 'Catorcena 26 (17 Dic - 31 Dic)' },
];

export default function Dashboard({ rows }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [catorcenaId, setCatorcenaId] = useState('20');

  // Actualizar el reloj en tiempo real cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Saludo dinámico según la hora del día
  const getSaludo = () => {
    const hora = currentTime.getHours();
    if (hora >= 5 && hora < 12) return 'Buenos días';
    if (hora >= 12 && hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const hoyStr = currentTime.toISOString().split('T')[0];
  const registroHoy = rows.find((r) => r[0] === hoyStr);

  // Obtener las fechas de inicio y fin de la catorcena seleccionada
  const catorcenaActiva = useMemo(() => {
    return CATORCENAS_2026.find((c) => String(c.id) === catorcenaId) || CATORCENAS_2026[19];
  }, [catorcenaId]);

  // Filtrar registros estrictamente dentro del rango de la catorcena seleccionada
  const registrosCatorcena = useMemo(() => {
    return rows.filter((row) => {
      const fechaCol = row[0];
      if (!fechaCol || !fechaCol.includes('-')) return false;
      return fechaCol >= catorcenaActiva.inicio && fechaCol <= catorcenaActiva.fin;
    });
  }, [rows, catorcenaActiva]);

  // Calcular horas acumuladas de la catorcena
  const totalHorasCatorcena = useMemo(() => {
    return registrosCatorcena.reduce((acc, row) => {
      return acc + (parseFloat(row[3]) || 0);
    }, 0);
  }, [registrosCatorcena]);

  const totalDiasCatorcena = registrosCatorcena.length;

  // --- LÓGICA DE LA VISTA SEMANAL (Jueves a Miércoles) ---
  const diasSemanaConfig = [
    { nombre: 'Jueves', offset: 0 },
    { nombre: 'Viernes', offset: 1 },
    { nombre: 'Sábado', offset: 2 },
    { nombre: 'Domingo', offset: 3 },
    { nombre: 'Lunes', offset: 4 },
    { nombre: 'Martes', offset: 5 },
    { nombre: 'Miércoles', offset: 6 },
  ];

  // Encontrar el inicio de la semana actual (Jueves más cercano hacia atrás o el actual)
  const obtenerSemanaActual = useMemo(() => {
    const d = new Date(currentTime);
    const day = d.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    // Distancia desde el Jueves (día 4)
    // Si hoy es Jueves (4) -> diff = 0
    // Si hoy es Viernes (5) -> diff = 1
    // Si hoy es Miércoles (3) -> diff = -6
    let diff = day - 4;
    if (diff < 0) diff += 7;

    const jueves = new Date(d);
    jueves.setDate(d.getDate() - diff);

    return diasSemanaConfig.map((item, index) => {
      const fechaDia = new Date(jueves);
      fechaDia.setDate(jueves.getDate() + index);
      const fechaStr = fechaDia.toISOString().split('T')[0];
      
      // Buscar si existe registro para este día exacto en las filas
      const registro = rows.find((r) => r[0] === fechaStr);

      return {
        nombre: item.nombre,
        fechaStr,
        fechaFormateada: fechaDia.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
        esHoy: fechaStr === hoyStr,
        entrada: registro ? registro[1] : null,
        salida: registro ? registro[2] : null,
        totalHoras: registro ? registro[3] : null,
      };
    });
  }, [currentTime, rows, hoyStr]);

  // Lógica de estado laboral en tiempo real
  const obtenerEstadoLaboral = () => {
    if (registroHoy) {
      return {
        titulo: '¡Jornada de hoy registrada con éxito!',
        descripcion: `Entrada: ${registroHoy[1]} - Salida: ${registroHoy[2]} (${registroHoy[3]} hrs)`,
        color: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/30 text-emerald-400',
        icono: CheckCircle2,
      };
    }

    const [hActual, mActual] = [currentTime.getHours(), currentTime.getMinutes()];
    const minutosActuales = hActual * 60 + mActual;
    const minutosInicioObjetivo = 9 * 60; // 09:00 AM
    const minutosSalidaObjetivo = 18 * 60; // 06:00 PM

    if (minutosActuales < minutosInicioObjetivo) {
      const diffMin = minutosInicioObjetivo - minutosActuales;
      const horasFaltan = Math.floor(diffMin / 60);
      const minsFaltan = diffMin % 60;
      return {
        titulo: 'Próximo a iniciar tu turno',
        descripcion: `Faltan aproximadamente ${horasFaltan > 0 ? `${horasFaltan}h ` : ''}${minsFaltan}m para el inicio de tu jornada laboral (09:00 a.m.).`,
        color: 'from-cyan-500/10 to-blue-500/5 border-cyan-500/30 text-cyan-400',
        icono: Timer,
      };
    } else if (minutosActuales >= minutosInicioObjetivo && minutosActuales <= minutosSalidaObjetivo) {
      const diffMin = minutosSalidaObjetivo - minutosActuales;
      const horasFaltan = Math.floor(diffMin / 60);
      const minsFaltan = diffMin % 60;
      return {
        titulo: 'Jornada laboral en curso',
        descripcion: `Te quedan aproximadamente ${horasFaltan}h ${minsFaltan}m para concluir tu horario de salida (06:00 p.m.). ¡Tú puedes!`,
        color: 'from-violet-500/10 to-fuchsia-500/5 border-violet-500/30 text-violet-300',
        icono: Briefcase,
      };
    } else {
      return {
        titulo: 'Fuera de horario laboral',
        descripcion: 'Has concluido las horas regulares del día. Recuerda que puedes registrar tus actividades en la sección "Registrar".',
        color: 'from-slate-800/40 to-slate-900/40 border-slate-700/30 text-slate-400',
        icono: Clock,
      };
    }
  };

  const estadoLaboral = obtenerEstadoLaboral();
  const IconoEstado = estadoLaboral.icono;

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN DE BIENVENIDA */}
      <div className="bg-gradient-to-r from-slate-900/80 via-violet-950/30 to-slate-900/80 border border-violet-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-cyan-400 text-xs font-medium">
            <SparklesIcon className="w-3.5 h-3.5" /> Panel Principal • WorkTime HR
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getSaludo()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Francisco</span> 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-xl leading-relaxed">
            Bienvenido a tu panel de control general. Consulta tus horas acumuladas y el estatus semanal.
          </p>
        </div>

        {/* Reloj digital */}
        <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full md:w-auto">
          <div className="bg-slate-950/60 border border-violet-500/20 rounded-2xl p-4 text-center min-w-[160px] shadow-inner">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono block mb-1">Hora Local</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Catorcena Activa */}
      <div className="bg-slate-900/60 border border-violet-500/20 rounded-2xl p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <Briefcase className="w-4 h-4 text-cyan-400" />
          <span>Mostrando métricas para:</span>
        </div>
        <select
          value={catorcenaId}
          onChange={(e) => setCatorcenaId(e.target.value)}
          className="bg-slate-950 border border-violet-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer w-full sm:w-72"
        >
          {CATORCENAS_2026.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* 2. ESTADO LABORAL INTELIGENTE */}
      <div className={`border rounded-3xl p-5 sm:p-6 backdrop-blur-xl bg-gradient-to-br ${estadoLaboral.color} flex items-start gap-4 shadow-xl transition-all`}>
        <div className="p-3 bg-slate-950/40 border border-white/10 rounded-2xl flex-shrink-0">
          <IconoEstado className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white tracking-wide">{estadoLaboral.titulo}</h3>
          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            {estadoLaboral.descripcion}
          </p>
        </div>
      </div>

      {/* 3. TARJETAS DE MÉTRICAS FILTRADAS POR CATORCENA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-violet-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Horas en Catorcena</span>
            <h2 className="text-3xl font-extrabold text-white font-mono">
              {totalHorasCatorcena.toFixed(2)} <span className="text-cyan-400 text-lg font-normal">hrs</span>
            </h2>
          </div>
          <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-cyan-400">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-violet-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Turnos en Catorcena</span>
            <h2 className="text-3xl font-extrabold text-white font-mono">
              {totalDiasCatorcena} <span className="text-violet-400 text-lg font-normal">días</span>
            </h2>
          </div>
          <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400">
            <Calendar className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* 4. VISTA RÁPIDA SEMANAL (Jueves a Miércoles) - RESPONSIVO */}
      <div className="bg-slate-900/60 border border-violet-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" /> Resumen Semanal (Jueves a Miércoles)
            </h3>
            <p className="text-xs text-slate-400">
              Control rápido de entradas y salidas de la semana laboral actual.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full w-fit">
            Ciclo Actual
          </span>
        </div>

        {/* Versión Desktop: Tabla estilizada */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Día</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Entrada</th>
                <th className="py-3 px-4">Salida</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {obtenerSemanaActual.map((dia, idx) => (
                <tr 
                  key={idx} 
                  className={`transition-colors ${dia.esHoy ? 'bg-violet-500/10 border-l-2 border-l-cyan-400' : 'hover:bg-slate-800/40'}`}
                >
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                    {dia.nombre}
                    {dia.esHoy && (
                      <span className="text-[10px] bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.5 rounded uppercase">
                        Hoy
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">{dia.fechaFormateada}</td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">
                    {dia.entrada ? dia.entrada : <span className="text-slate-600 italic">--:--</span>}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-violet-300">
                    {dia.salida ? dia.salida : <span className="text-slate-600 italic">--:--</span>}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">
                    {dia.totalHoras ? `${dia.totalHoras}` : <span className="text-slate-600 italic">-</span>}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {dia.entrada && dia.salida ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Registrado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
                        Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Versión Mobile: Tarjetas responsivas apiladas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
          {obtenerSemanaActual.map((dia, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-2xl border transition-all ${dia.esHoy ? 'bg-violet-500/10 border-cyan-500/50 shadow-lg' : 'bg-slate-950/40 border-slate-800'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{dia.nombre}</span>
                  <span className="text-xs text-slate-400 font-mono">({dia.fechaFormateada})</span>
                </div>
                {dia.esHoy && (
                  <span className="text-[10px] bg-cyan-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">
                    Hoy
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-800/80 text-center my-2">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Entrada</span>
                  <span className="font-mono text-xs text-cyan-300 font-semibold">
                    {dia.entrada || '--:--'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Salida</span>
                  <span className="font-mono text-xs text-violet-300 font-semibold">
                    {dia.salida || '--:--'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Total</span>
                  <span className="font-mono text-xs text-emerald-400 font-semibold">
                    {dia.totalHoras || '--'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Estatus:</span>
                {dia.entrada && dia.salida ? (
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Registrado
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Pendiente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}