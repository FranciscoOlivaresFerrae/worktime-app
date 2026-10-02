import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Registrar from './pages/RegistrarJornada';
import Historial from './pages/Historial';
import Reportes from './pages/Reportes';
import InfoGeneral from './pages/InfoGeneral';
import BetaInfoModal from './components/BetaInfoModal';
import NotificationModal from './components/NotificationModal'; // <-- Nuevo modal importado

import { useWorkTime } from './hooks/useWorkTime';

export default function App() {
  const {
    token,
    loading,
    rows,
    fecha,
    setFecha,
    horaEntrada,
    setHoraEntrada,
    horaSalida,
    setHoraSalida,
    horasTrabajadas,
    showBetaModal,
    setShowBetaModal,
    showErrorModal,
    setShowErrorModal,
    modalMessage,       // <-- Extraído del hook
    setModalMessage,    // <-- Extraído del hook
    isOnline,
    requestAccessToken,
    handleRefresh,
    handleCheckConnectionAndSync,
    handleSubmit,
    handleUpdateRow,
    handleDeleteRow,
    handleLogout,
  } = useWorkTime();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  if (!token) {
    return <Landing onRequestAuth={requestAccessToken} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)} 
          isOnline={isOnline}
          onCheckConnection={handleCheckConnectionAndSync}
          loading={loading}
        />

        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {activePage === 'dashboard' && (
            <Dashboard rows={rows} />
          )}

          {activePage === 'registrar' && (
            <Registrar
              rows={rows}
              fecha={fecha}
              setFecha={setFecha}
              horaEntrada={horaEntrada}
              setHoraEntrada={setHoraEntrada}
              horaSalida={horaSalida}
              setHoraSalida={setHoraSalida}
              horasTrabajadas={horasTrabajadas}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          )}

          {activePage === 'historial' && (
            <Historial 
              rows={rows} 
              handleRefresh={handleRefresh} 
              onUpdateRow={handleUpdateRow}
              onDeleteRow={handleDeleteRow}
              loading={loading} 
            />
          )}

          {activePage === 'reportes' && <Reportes rows={rows} />}

          {activePage === 'info' && <InfoGeneral />}
        </main>

        <footer className="mt-auto py-6 px-4 border-t border-violet-500/10 text-center text-slate-500 text-xs sm:text-sm font-light">
          <p>Página desarrollada por: <span className="text-slate-300 font-normal">Francisco Antonio Olivares Ferraez</span></p>
        </footer>
      </div>

      <BetaInfoModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        type="beta"
      />

      <BetaInfoModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
      />

      {/* Modal personalizado para notificaciones de conexión / sincronización */}
      <NotificationModal
        isOpen={modalMessage.show}
        onClose={() => setModalMessage((prev) => ({ ...prev, show: false }))}
        title={modalMessage.title}
        message={modalMessage.message}
        type={modalMessage.type}
      />
    </div>
  );
}