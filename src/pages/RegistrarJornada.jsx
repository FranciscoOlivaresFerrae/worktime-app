import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Plus, Sparkles, RefreshCw, Lock, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RegistrarJornada({
  rows = [],
  fecha,
  setFecha,
  horaEntrada,
  setHoraEntrada,
  horaSalida,
  setHoraSalida,
  horasTrabajadas,
  handleSubmit,
  loading,
  catorcenaActualLabel = "Catorcena Actual (En curso)"
}) {
  const [activePicker, setActivePicker] = useState(null); // 'entrada' | 'salida' | 'fecha' | null

  // Estados temporales para el modal de hora
  const [tempHour, setTempHour] = useState('12');
  const [tempMinute, setTempMinute] = useState('00');
  const [tempPeriod, setTempPeriod] = useState('AM');

  // Estado temporal para el selector de fecha (mes y año actual de navegación)
  const [viewDate, setViewDate] = useState(() => {
    return fecha ? new Date(fecha + 'T00:00:00') : new Date();
  });
  const [tempSelectedDate, setTempSelectedDate] = useState(fecha || '');

  // Cálculo total de horas para la catorcena en vista
  const totalHorasCatorcenal = rows.reduce((acc, row) => {
    const val = parseFloat(row[3]) || 0;
    return acc + val;
  }, 0);

  // Filtramos para contar únicamente los días registrados válidos dentro de la catorcena
  const registrosValidos = rows.filter((row) => {
    const fechaCol = row[0];
    return fechaCol && fechaCol.includes('-'); 
  });

  const totalDiasCatorcenal = registrosValidos.length;

  // Abrir el selector de hora
  const openTimePicker = (type, currentVal) => {
    if (currentVal) {
      const [h24, m] = currentVal.split(':');
      let hNum = parseInt(h24, 10);
      const period = hNum >= 12 ? 'PM' : 'AM';
      hNum = hNum % 12;
      hNum = hNum ? hNum : 12;
      setTempHour(hNum.toString().padStart(2, '0'));
      setTempMinute(m || '00');
      setTempPeriod(period);
    } else {
      setTempHour('12');
      setTempMinute('00');
      setTempPeriod('AM');
    }
    setActivePicker(type);
  };

  // Abrir el selector de fecha (Permite fechas pasadas y futuras sin restricciones)
  const openDatePicker = () => {
    if (fecha) {
      const parts = fecha.split('-');
      if (parts.length === 3) {
        setViewDate(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
      }
    } else {
      setViewDate(new Date());
    }
    setTempSelectedDate(fecha || '');
    setActivePicker('fecha');
  };

  // Confirmar la hora seleccionada en el modal
  const handleConfirmTime = () => {
    let h24 = parseInt(tempHour, 10);
    if (tempPeriod === 'PM' && h24 < 12) h24 += 12;
    if (tempPeriod === 'AM' && h24 === 12) h24 = 0;

    const time24h = `${h24.toString().padStart(2, '0')}:${tempMinute}`;

    if (activePicker === 'entrada') {
      setHoraEntrada(time24h);
    } else if (activePicker === 'salida') {
      setHoraSalida(time24h);
    }
    setActivePicker(null);
  };

  // Confirmar la fecha seleccionada en el modal
  const handleConfirmDate = () => {
    if (tempSelectedDate) {
      setFecha(tempSelectedDate);
    }
    setActivePicker(null);
  };

  // Formatear 24h a 12h legible para la UI
  const formatDisplayTime = (time24h) => {
    if (!time24h) return 'Seleccionar hora...';
    const [h24, m] = time24h.split(':');
    let h = parseInt(h24, 10);
    const period = h >= 12 ? 'p. m.' : 'a. m.';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${m} ${period}`;
  };

  // Formatear fecha para mostrarse amigable
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Seleccionar fecha...';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Generación de días del mes para el calendario modal
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const adjustedFirstDay = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div className="space-y-6">
      {/* Tarjetas de Resumen Catorcenal con Indicador de Período Actual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Acumulado Catorcena Actual */}
        <div className="bg-slate-900/60 border border-violet-500/20 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              {catorcenaActualLabel}
            </span>
            <div className="p-2 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-cyan-400 rounded-xl border border-violet-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Acumulado</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-300">
              {totalHorasCatorcenal.toFixed(2)} <span className="text-sm font-normal text-slate-400">hrs</span>
            </p>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">
            * Para consultar catorcenas pasadas, ve a la sección de Historial/Registros.
          </p>
        </div>

        {/* Días Registrados en la Catorcena Actual */}
        <div className="bg-slate-900/60 border border-violet-500/20 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              Activa
            </span>
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Días Registrados</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              {totalDiasCatorcenal} <span className="text-sm font-normal text-slate-400">días</span>
            </p>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">
            * Permite el registro tanto de jornadas pasadas como futuras.
          </p>
        </div>

      </div>

      {/* Formulario de Registro */}
      <div className="bg-slate-900/60 border border-violet-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" /> Registrar o Planificar Jornada Catorcenal
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Fecha */}
          <div className="relative">
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Fecha (Actual o Futura)</label>
            <div
              onClick={openDatePicker}
              className="flex items-center justify-between bg-slate-950/80 border border-violet-500/30 rounded-xl px-4 py-3 cursor-pointer group hover:border-cyan-400/50 transition-all"
            >
              <span className={`text-sm truncate ${fecha ? 'text-white font-medium' : 'text-slate-500'}`}>
                {formatDisplayDate(fecha)}
              </span>
              <Calendar className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-all flex-shrink-0 ml-2" />
            </div>
          </div>

          {/* Hora Entrada */}
          <div className="relative">
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Hora Entrada</label>
            <div
              onClick={() => openTimePicker('entrada', horaEntrada)}
              className="flex items-center justify-between bg-slate-950/80 border border-violet-500/30 rounded-xl px-4 py-3 cursor-pointer group hover:border-cyan-400/50 transition-all"
            >
              <span className={`text-sm ${horaEntrada ? 'text-white font-medium' : 'text-slate-500'}`}>
                {formatDisplayTime(horaEntrada)}
              </span>
              <Clock className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-all flex-shrink-0 ml-2" />
            </div>
          </div>

          {/* Hora Salida */}
          <div className="relative">
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Hora Salida</label>
            <div
              onClick={() => openTimePicker('salida', horaSalida)}
              className="flex items-center justify-between bg-slate-950/80 border border-violet-500/30 rounded-xl px-4 py-3 cursor-pointer group hover:border-cyan-400/50 transition-all"
            >
              <span className={`text-sm ${horaSalida ? 'text-white font-medium' : 'text-slate-500'}`}>
                {formatDisplayTime(horaSalida)}
              </span>
              <Clock className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-all flex-shrink-0 ml-2" />
            </div>
          </div>

          {/* Horas Calc. */}
          <div className="relative">
            <label className="block text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-500" /> Horas Calc.
            </label>
            <input
              type="number"
              value={horasTrabajadas}
              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-300 font-bold opacity-70 cursor-not-allowed"
              placeholder="0.00"
              readOnly
            />
          </div>

          {/* Botón Guardar */}
          <div className="flex items-end">
            <motion.button
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
              type="submit"
              disabled={loading || !horasTrabajadas}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm shadow-lg h-[46px]"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Guardar Jornada
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* MODAL PERSONALIZADO CYBER DARK (FECHA Y HORA) */}
      <AnimatePresence>
        {activePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            
            {/* MODAL DE FECHA */}
            {activePicker === 'fecha' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-violet-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl shadow-violet-950/50 flex flex-col items-center relative overflow-hidden"
              >
                <div className="flex items-center justify-between w-full mb-4 border-b border-violet-500/20 pb-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Calendar className="w-5 h-5" />
                    <span className="font-bold text-sm text-white tracking-wide">Seleccionar Fecha (Libre)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePicker(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between w-full mb-4 px-1">
                  <button
                    type="button"
                    onClick={() => setViewDate(new Date(year, month - 1, 1))}
                    className="p-2 bg-slate-950/60 border border-violet-500/20 hover:border-cyan-400/40 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-white tracking-wide capitalize">
                    {monthNames[month]} {year}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewDate(new Date(year, month + 1, 1))}
                    className="p-2 bg-slate-950/60 border border-violet-500/20 hover:border-cyan-400/40 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 w-full mb-2 text-center">
                  {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => (
                    <span key={d} className="text-[11px] font-semibold text-slate-500 uppercase">{d}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 w-full mb-4">
                  {Array.from({ length: adjustedFirstDay }).map((_, idx) => (
                    <div key={`empty-${idx}`} />
                  ))}

                  {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const mStr = (month + 1).toString().padStart(2, '0');
                    const dStr = dayNum.toString().padStart(2, '0');
                    const currentCellDateStr = `${year}-${mStr}-${dStr}`;
                    const isSelected = tempSelectedDate === currentCellDateStr;

                    return (
                      <button
                        key={currentCellDateStr}
                        type="button"
                        onClick={() => setTempSelectedDate(currentCellDateStr)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md shadow-cyan-950/50 scale-105'
                            : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>

                <div className="w-full mb-3 py-2 px-3 bg-slate-950/80 border border-violet-500/20 rounded-xl text-cyan-300 text-xs font-mono text-center tracking-wider">
                  {tempSelectedDate ? formatDisplayDate(tempSelectedDate) : 'Ninguna fecha seleccionada'}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleConfirmDate}
                  disabled={!tempSelectedDate}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" /> Confirmar Fecha
                </motion.button>
              </motion.div>
            )}

            {/* MODALES DE HORA (ENTRADA / SALIDA) */}
            {(activePicker === 'entrada' || activePicker === 'salida') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-violet-500/30 rounded-3xl p-6 w-full max-w-xs shadow-2xl shadow-violet-950/50 flex flex-col items-center relative overflow-hidden"
              >
                <div className="flex items-center justify-between w-full mb-4 border-b border-violet-500/20 pb-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Clock className="w-5 h-5" />
                    <span className="font-bold text-sm text-white tracking-wide">
                      {activePicker === 'entrada' ? 'Hora de Entrada' : 'Hora de Salida'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePicker(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full my-2 h-48 overflow-y-auto pr-1">
                  <div className="flex flex-col space-y-1 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Hora</span>
                    {hoursList.map((h) => {
                      const isSelected = tempHour === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setTempHour(h)}
                          className={`py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md shadow-cyan-950/50 scale-105'
                              : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col space-y-1 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Min</span>
                    {minutesList.map((m) => {
                      const isSelected = tempMinute === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTempMinute(m)}
                          className={`py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md shadow-cyan-950/50 scale-105'
                              : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col space-y-2 text-center justify-start pt-5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Periodo</span>
                    {['AM', 'PM'].map((p) => {
                      const isSelected = tempPeriod === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTempPeriod(p)}
                          className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-md shadow-cyan-950/50 scale-105'
                              : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {p === 'AM' ? 'a. m.' : 'p. m.'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="my-3 py-1.5 px-4 bg-slate-950/80 border border-violet-500/20 rounded-xl text-cyan-300 text-sm font-mono tracking-wider">
                  {tempHour}:{tempMinute} {tempPeriod === 'AM' ? 'a. m.' : 'p. m.'}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleConfirmTime}
                  className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer text-sm"
                >
                  <Check className="w-4 h-4" /> Confirmar Hora
                </motion.button>
              </motion.div>
            )}

          </div>
        )}
      </AnimatePresence>
    </div>
  );
}