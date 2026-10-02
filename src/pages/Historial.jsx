import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Filter, RefreshCw, Clock, FileText, CheckCircle2, Briefcase, Edit3, Trash2, X, Check} from 'lucide-react';

// Lista oficial de catorcenas extraídas del calendario 2026
const CATORCENAS_2026 = [
  { id: 1, mes: 'ENE', inicio: '2026-01-01', fin: '2026-01-14', label: 'Catorcena 01 (01 Ene - 14 Ene)' },
  { id: 2, mes: 'ENE', inicio: '2026-01-15', fin: '2026-01-28', label: 'Catorcena 02 (15 Ene - 28 Ene)' },
  { id: 3, mes: 'FEB', inicio: '2026-01-29', fin: '2026-02-11', label: 'Catorcena 03 (29 Ene - 11 Feb)' },
  { id: 4, mes: 'FEB', inicio: '2026-02-12', fin: '2026-02-25', label: 'Catorcena 04 (12 Feb - 25 Feb)' },
  { id: 5, mes: 'MAR', inicio: '2026-02-26', fin: '2026-03-11', label: 'Catorcena 05 (26 Feb - 11 Mar)' },
  { id: 6, mes: 'MAR', inicio: '2026-03-12', fin: '2026-03-25', label: 'Catorcena 06 (12 Mar - 25 Mar)' },
  { id: 7, mes: 'ABR', inicio: '2026-03-26', fin: '2026-04-08', label: 'Catorcena 07 (26 Mar - 08 Abr)' },
  { id: 8, mes: 'ABR', inicio: '2026-04-09', fin: '2026-04-22', label: 'Catorcena 08 (09 Abr - 22 Abr)' },
  { id: 9, mes: 'MAY', inicio: '2026-04-23', fin: '2026-05-06', label: 'Catorcena 09 (23 Abr - 06 May)' },
  { id: 10, mes: 'MAY', inicio: '2026-05-07', fin: '2026-05-20', label: 'Catorcena 10 (07 May - 20 May)' },
  { id: 11, mes: 'MAY', inicio: '2026-05-21', fin: '2026-06-03', label: 'Catorcena 11 (21 May - 03 Jun)' },
  { id: 12, mes: 'JUN', inicio: '2026-06-04', fin: '2026-06-17', label: 'Catorcena 12 (04 Jun - 17 Jun)' },
  { id: 13, mes: 'JUN', inicio: '2026-06-18', fin: '2026-07-01', label: 'Catorcena 13 (18 Jun - 01 Jul)' },
  { id: 14, mes: 'JUL', inicio: '2026-07-02', fin: '2026-07-15', label: 'Catorcena 14 (02 Jul - 15 Jul)' },
  { id: 15, mes: 'JUL', inicio: '2026-07-16', fin: '2026-07-29', label: 'Catorcena 15 (16 Jul - 29 Jul)' },
  { id: 16, mes: 'AGO', inicio: '2026-07-30', fin: '2026-08-12', label: 'Catorcena 16 (30 Jul - 12 Ago)' },
  { id: 17, mes: 'AGO', inicio: '2026-08-13', fin: '2026-08-26', label: 'Catorcena 17 (13 Ago - 26 Ago)' },
  { id: 18, mes: 'SEP', inicio: '2026-08-27', fin: '2026-09-09', label: 'Catorcena 18 (27 Ago - 09 Sep)' },
  { id: 19, mes: 'SEP', inicio: '2026-09-10', fin: '2026-09-23', label: 'Catorcena 19 (10 Sep - 23 Sep)' },
  { id: 20, mes: 'OCT', inicio: '2026-09-24', fin: '2026-10-07', label: 'Catorcena 20 (24 Sep - 07 Oct)' },
  { id: 21, mes: 'OCT', inicio: '2026-10-08', fin: '2026-10-21', label: 'Catorcena 21 (08 Oct - 21 Oct)' },
  { id: 22, mes: 'OCT', inicio: '2026-10-22', fin: '2026-11-04', label: 'Catorcena 22 (22 Oct - 04 Nov)' },
  { id: 23, mes: 'NOV', inicio: '2026-11-05', fin: '2026-11-18', label: 'Catorcena 23 (05 Nov - 18 Nov)' },
  { id: 24, mes: 'NOV', inicio: '2026-11-19', fin: '2026-12-02', label: 'Catorcena 24 (19 Nov - 02 Dic)' },
  { id: 25, mes: 'DIC', inicio: '2026-12-03', fin: '2026-12-16', label: 'Catorcena 25 (03 Dic - 16 Dic)' },
  { id: 26, mes: 'DIC', inicio: '2026-12-17', fin: '2026-12-31', label: 'Catorcena 26 (17 Dic - 31 Dic)' },
];

export default function HistorialFiltros({ rows, onRefresh, onUpdateRow, onDeleteRow }) {
  const [catorcenaSeleccionada, setCatorcenaSeleccionada] = useState('20');
  const [fechaInicio, setFechaInicio] = useState('2026-09-24');
  const [fechaFin, setFechaFin] = useState('2026-10-07');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados de edición
  const [editingRow, setEditingRow] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editEntrada, setEditEntrada] = useState('08:00');
  const [editSalida, setEditSalida] = useState('17:00');

  // Controladores para los selectores cyber dark flotantes
  const [activePicker, setActivePicker] = useState(null); // 'entrada' | 'salida' | null

  // LISTAS COMPLETAS: Horas del 01 al 12 y Minutos del 00 al 59
  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // Estados temporales dentro del modal de hora
  const [tempHour, setTempHour] = useState('08');
  const [tempMinute, setTempMinute] = useState('00');
  const [tempPeriod, setTempPeriod] = useState('AM');

  const [deletingIndex, setDeletingIndex] = useState(null);

  const handleCatorcenaChange = (e) => {
    const val = e.target.value;
    setCatorcenaSeleccionada(val);
    if (val === 'custom') return;

    const encontrada = CATORCENAS_2026.find((c) => String(c.id) === val);
    if (encontrada) {
      setFechaInicio(encontrada.inicio);
      setFechaFin(encontrada.fin);
    }
  };

  const registrosValidos = useMemo(() => {
    return rows.map((row, originalIndex) => ({ row, originalIndex })).filter(({ row }) => {
      const fechaCol = row[0];
      return fechaCol && fechaCol.includes('-');
    });
  }, [rows]);

  const registrosFiltrados = useMemo(() => {
    return registrosValidos.filter(({ row }) => {
      const [fechaStr] = row;
      if (fechaInicio && fechaStr < fechaInicio) return false;
      if (fechaFin && fechaStr > fechaFin) return false;
      return true;
    });
  }, [registrosValidos, fechaInicio, fechaFin]);

  const totalHorasPeriodo = useMemo(() => {
    return registrosFiltrados.reduce((acc, { row }) => {
      return acc + (parseFloat(row[3]) || 0);
    }, 0);
  }, [registrosFiltrados]);

  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const limpiarFiltros = () => {
    setCatorcenaSeleccionada('custom');
    setFechaInicio('');
    setFechaFin('');
  };

  // Convertir formato 24h (ej. "14:30") a 12h (h: "02", m: "30", p: "PM") para inicializar los selectores
  const parseTo12h = (time24) => {
    if (!time24 || !time24.includes(':')) return { h: '08', m: '00', p: 'AM' };
    const [hStr, mStr] = time24.split(':');
    let hNum = parseInt(hStr, 10);
    let p = 'AM';
    if (hNum >= 12) {
      p = 'PM';
      if (hNum > 12) hNum -= 12;
    }
    if (hNum === 0) hNum = 12;
    return {
      h: String(hNum).padStart(2, '0'),
      m: mStr || '00',
      p: p,
    };
  };

  // GESTIÓN CLAVE: Convierte estrictamente 12h (AM/PM) a formato 24h (HH:mm) para evitar incongruencias en Excel/Base de datos
  const convertTo24h = (h, m, p) => {
    let hNum = parseInt(h, 10);
    if (p === 'PM' && hNum < 12) hNum += 12;
    if (p === 'AM' && hNum === 12) hNum = 0;
    return `${String(hNum).padStart(2, '0')}:${m}`;
  };

  const openEditModal = (originalIndex, row) => {
    setEditIndex(originalIndex);
    const entrada24 = row[1] || '08:00';
    const salida24 = row[2] || '17:00';
    setEditEntrada(entrada24);
    setEditSalida(salida24);
    setEditingRow(row);
  };

  const openPicker = (type) => {
    setActivePicker(type);
    const targetTime = type === 'entrada' ? editEntrada : editSalida;
    const parsed = parseTo12h(targetTime);
    setTempHour(parsed.h);
    setTempMinute(parsed.m);
    setTempPeriod(parsed.p);
  };

  const handleConfirmTime = () => {
    // Aquí se genera la conversión limpia a 24 horas exactas
    const final24 = convertTo24h(tempHour, tempMinute, tempPeriod);
    if (activePicker === 'entrada') {
      setEditEntrada(final24);
    } else if (activePicker === 'salida') {
      setEditSalida(final24);
    }
    setActivePicker(null);
  };

  const calcularHorasDiff = (eTime, sTime) => {
    if (!eTime || !sTime) return '0.00';
    const [eH, eM] = eTime.split(':').map(Number);
    const [sH, sM] = sTime.split(':').map(Number);
    let diff = (sH * 60 + sM) - (eH * 60 + eM);
    if (diff < 0) diff += 24 * 60;
    return (diff / 60).toFixed(2);
  };

  const handleSaveEdit = () => {
    if (onUpdateRow && editIndex !== null) {
      const novasHoras = calcularHorasDiff(editEntrada, editSalida);
      // Se mandan los datos en formato 24 horas estricto al componente padre / Excel
      onUpdateRow(editIndex, [editingRow[0], editEntrada, editSalida, novasHoras]);
    }
    setEditingRow(null);
    setEditIndex(null);
  };

  const handleDeleteConfirm = () => {
    if (onDeleteRow && deletingIndex !== null) {
      onDeleteRow(deletingIndex);
    }
    setDeletingIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-violet-500/20 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-cyan-400 rounded-xl border border-violet-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Horas en esta Catorcena</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-300">
              {totalHorasPeriodo.toFixed(2)} <span className="text-sm font-normal text-slate-400">hrs</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-violet-500/20 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Turnos en el Periodo</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              {registrosFiltrados.length} <span className="text-sm font-normal text-slate-400">registros</span>
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor Principal de Filtros */}
      <div className="bg-slate-900/60 border border-violet-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-violet-500/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-600/30 to-cyan-600/30 rounded-xl border border-violet-500/30 text-cyan-400">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Cortes Catorcenales e Historial</h2>
              <p className="text-xs text-slate-400">Administra, modifica o elimina turnos ante cambios de horario</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefreshClick}
            className="self-start sm:self-auto flex items-center gap-2 bg-slate-950/80 hover:bg-slate-800 border border-violet-500/30 text-cyan-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sincronizar Datos
          </motion.button>
        </div>

        {/* Controles de Selección */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-violet-500/10">
          <div className="lg:col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" /> Catorcena Oficial 2026
            </label>
            <select
              value={catorcenaSeleccionada}
              onChange={handleCatorcenaChange}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="custom">Personalizar Rango Manualmente...</option>
              {CATORCENAS_2026.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Fecha Inicial (Desde)
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setCatorcenaSeleccionada('custom');
              }}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Fecha Final (Hasta)
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setCatorcenaSeleccionada('custom');
              }}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={limpiarFiltros}
            className="bg-slate-900 hover:bg-slate-800 border border-violet-500/20 text-slate-300 hover:text-white font-medium py-2 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
          >
            Ver Todo el Historial (Sin Filtros)
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-violet-500/20 bg-slate-950/60 shadow-inner">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-violet-500/20 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5">Fecha del Turno</th>
                <th className="py-4 px-5">Hora de Entrada</th>
                <th className="py-4 px-5">Hora de Salida</th>
                <th className="py-4 px-5 text-right">Horas Trabajadas</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-500/10 text-xs">
              {registrosFiltrados.length > 0 ? (
                registrosFiltrados.map(({ row, originalIndex }, index) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={originalIndex}
                    className="hover:bg-violet-950/25 transition-colors group"
                  >
                    <td className="py-4 px-5 font-medium text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
                      {formatFriendlyDate(row[0])}
                    </td>
                    <td className="py-4 px-5 text-slate-300 font-mono">
                      {row[1] || '—'}
                    </td>
                    <td className="py-4 px-5 text-slate-300 font-mono">
                      {row[2] || '—'}
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-300">
                      {row[3]} {row[3] && !String(row[3]).includes('hrs') ? 'hrs' : ''}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(originalIndex, row)}
                          title="Modificar Horarios"
                          className="p-2 bg-slate-900 border border-violet-500/30 hover:border-cyan-400 text-cyan-400 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingIndex(originalIndex)}
                          title="Eliminar Registro"
                          className="p-2 bg-slate-900 border border-red-500/30 hover:border-red-400 text-red-400 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-400" />
                    No se encontraron registros de turnos en esta catorcena o rango seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PRINCIPAL DE EDICIÓN */}
      <AnimatePresence>
        {editingRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-violet-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl shadow-violet-950/50 flex flex-col items-center relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full mb-4 border-b border-violet-500/20 pb-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Edit3 className="w-5 h-5" />
                  <span className="font-bold text-sm text-white tracking-wide">Modificar Turno</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full space-y-4 my-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">Fecha</label>
                  <input
                    type="date"
                    value={editingRow[0]}
                    disabled
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>

                {/* BOTÓN APERTURA MODAL HORA ENTRADA */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">Hora de Entrada (Formato 24h)</label>
                  <button
                    type="button"
                    onClick={() => openPicker('entrada')}
                    className="w-full bg-slate-950 border border-violet-500/30 hover:border-cyan-400 rounded-xl px-3 py-3 text-xs text-white flex items-center justify-between cursor-pointer font-mono transition-colors shadow-inner"
                  >
                    <span className="flex items-center gap-2 text-cyan-300 font-semibold">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      {editEntrada} hrs
                    </span>
                    <span className="text-[10px] bg-violet-950/80 text-violet-300 border border-violet-500/30 px-2 py-1 rounded-lg">Cambiar</span>
                  </button>
                </div>

                {/* BOTÓN APERTURA MODAL HORA SALIDA */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">Hora de Salida (Formato 24h)</label>
                  <button
                    type="button"
                    onClick={() => openPicker('salida')}
                    className="w-full bg-slate-950 border border-violet-500/30 hover:border-cyan-400 rounded-xl px-3 py-3 text-xs text-white flex items-center justify-between cursor-pointer font-mono transition-colors shadow-inner"
                  >
                    <span className="flex items-center gap-2 text-cyan-300 font-semibold">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      {editSalida} hrs
                    </span>
                    <span className="text-[10px] bg-violet-950/80 text-violet-300 border border-violet-500/30 px-2 py-1 rounded-lg">Cambiar</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-4">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 text-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Guardar Cambios
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CYBER DARK: SELECTOR DE HORA LIBRE (12h CON TODOS LOS MINUTOS 00-59 Y CONVERSIÓN A 24h) */}
      <AnimatePresence>
        {activePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-violet-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl shadow-violet-950/50 flex flex-col items-center relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full mb-4 border-b border-violet-500/20 pb-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold text-sm text-white tracking-wide">
                    {activePicker === 'entrada' ? 'Seleccionar Entrada' : 'Seleccionar Salida'}
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

              {/* Contenedor de columnas de selección libre (Con scroll independiente y fluido) */}
              <div className="grid grid-cols-3 gap-2 w-full my-2 h-56 overflow-hidden pr-1">
                
                {/* Columna Horas (01-12) */}
                <div className="flex flex-col space-y-1 text-center overflow-y-auto pr-1 custom-scrollbar">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 sticky top-0 bg-slate-900 py-1 z-10">Hora</span>
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

                {/* Columna Minutos (Todos del 00 al 59) */}
                <div className="flex flex-col space-y-1 text-center overflow-y-auto pr-1 custom-scrollbar">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 sticky top-0 bg-slate-900 py-1 z-10">Minuto</span>
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

                {/* Columna Periodo (AM / PM) */}
                <div className="flex flex-col space-y-2 text-center justify-start pt-6">
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

              {/* Vista previa en tiempo real de la hora seleccionada (12h visual, guardándose en 24h) */}
              <div className="w-full mt-3 p-3 bg-slate-950/90 border border-violet-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Vista previa 12h:</p>
                  <p className="text-cyan-300 text-xs font-mono font-bold">{tempHour}:{tempMinute} {tempPeriod === 'AM' ? 'a. m.' : 'p. m.'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Se guardará en Excel (24h):</p>
                  <p className="text-emerald-400 text-xs font-mono font-bold">{convertTo24h(tempHour, tempMinute, tempPeriod)} hrs</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleConfirmTime}
                className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer text-sm"
              >
                <Check className="w-4 h-4" /> Confirmar y Convertir Hora
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <AnimatePresence>
        {deletingIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl shadow-red-950/50 flex flex-col items-center text-center"
            >
              <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">¿Eliminar este registro?</h3>
              <p className="text-xs text-slate-400 mb-5">
                Esta acción borrará el turno de este día de forma permanente.
              </p>

              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setDeletingIndex(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-red-950/40"
                >
                  Sí, Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}