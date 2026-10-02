import { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Download, Calendar } from 'lucide-react';

export default function Reportes({ rows }) {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const exportToExcel = (dataToExport, filename) => {
    const ws = XLSX.utils.aoa_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jornadas HR');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleExportAll = () => {
    if (rows.length === 0) return alert('No hay datos para exportar');
    exportToExcel(rows, 'WorkTime_Reporte_General');
  };

  const handleExportFiltered = () => {
    if (!fechaInicio || !fechaFin) return alert('Selecciona un rango de fechas válido');
    const headers = rows[0];
    const filteredRows = rows.slice(1).filter((row) => {
      const fechaRow = row[0];
      return fechaRow >= fechaInicio && fechaRow <= fechaFin;
    });

    if (filteredRows.length === 0) return alert('No hay registros en ese rango de fechas');
    exportToExcel([headers, ...filteredRows], `WorkTime_Reporte_${fechaInicio}_a_${fechaFin}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-violet-500/20 rounded-3xl p-6 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-400" /> Exportar Reportes Excel
        </h2>
        <p className="text-slate-400 text-sm mb-6 font-light">
          Genera reportes descargables en formato `.xlsx` para tu control personal o RRHH.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/60 border border-violet-500/20 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-cyan-400" /> Filtrar Por Rango de Fechas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Desde</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Hasta</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <button
              onClick={handleExportFiltered}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Descargar Excel Filtrado
            </button>
          </div>

          <div className="bg-slate-950/60 border border-violet-500/20 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm mb-2">
                <FileSpreadsheet className="w-4 h-4 text-violet-400" /> Reporte Histórico Completo
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-light">
                Exporta la totalidad de tus jornadas registradas desde el inicio en tu hoja de cálculo.
              </p>
            </div>
            <button
              onClick={handleExportAll}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Descargar Todo en Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}