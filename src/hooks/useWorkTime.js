import { useState, useEffect } from 'react';
import {
  initGoogleAuth,
  requestAccessToken,
  getOrCreateSpreadsheet,
  addRowToSheet,
  getSheetData,
  updateRowInSheet,
  deleteRowFromSheet,
} from '../services/googleSheets';

// Claves para el almacenamiento local y la cola offline
const CACHE_KEY = 'worktime_rows_cache';
const QUEUE_KEY = 'worktime_sync_queue';

export function useWorkTime() {
  const [token, setToken] = useState(() => localStorage.getItem('google_access_token') || null);
  const [spreadsheetId, setSpreadsheetId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Inicializamos las filas desde el caché local para carga instantánea offline
  const [rows, setRows] = useState(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Estado para el modal de notificaciones personalizado (reemplaza las alertas cutres)
  const [modalMessage, setModalMessage] = useState({ show: false, title: '', message: '', type: 'success' });

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');

  // Indicador de estado de red
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  function handleLogout() {
    setToken(null);
    setSpreadsheetId(null);
    setRows([]);
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry'); // 💡 Limpiamos la expiración
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(QUEUE_KEY);
  }

  // Guardar en caché y actualizar estado de filas
  const updateRowsStateAndCache = (newRows) => {
    setRows(newRows);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newRows));
  };

  // Agregar acción a la cola de pendientes offline
  const enqueueSyncAction = (actionType, payload) => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({ actionType, payload, timestamp: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log(`📦 Acción guardada en cola offline [${actionType}]:`, payload);
  };

  // Procesar la cola de sincronización cuando vuelve el internet
  const processSyncQueue = async (currentToken, currentSpreadsheetId) => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    console.log(`🔄 Sincronizando ${queue.length} acciones pendientes con Google Sheets...`);
    setLoading(true);

    try {
      for (const item of queue) {
        if (item.actionType === 'ADD') {
          await addRowToSheet(currentToken, currentSpreadsheetId, item.payload);
        } else if (item.actionType === 'UPDATE') {
          await updateRowInSheet(currentToken, currentSpreadsheetId, item.payload.index, item.payload.updatedRow);
        } else if (item.actionType === 'DELETE') {
          await deleteRowFromSheet(currentToken, currentSpreadsheetId, item.payload.index);
        }
      }
      // Limpiar cola si todo salió bien
      localStorage.removeItem(QUEUE_KEY);
      // Refrescar datos reales desde la nube
      const freshData = await getSheetData(currentToken, currentSpreadsheetId);
      updateRowsStateAndCache(freshData);
      console.log('✅ Sincronización offline completada con éxito.');
    } catch (err) {
      console.error('❌ Error al procesar la cola de sincronización:', err);
    } finally {
      setLoading(false);
    }
  };

  async function initializeUserData(accessToken) {
    setLoading(true);
    try {
      const sheetId = await getOrCreateSpreadsheet(accessToken);
      setSpreadsheetId(sheetId);
      
      if (navigator.onLine) {
        await processSyncQueue(accessToken, sheetId);
      }

      const data = await getSheetData(accessToken, sheetId);
      updateRowsStateAndCache(data);
    } catch (err) {
      console.error('ERROR CRÍTICO EN TERMINAL (Google Sheets Init):', err);
      // 💡 Si detectamos error 401 o credenciales inválidas, forzamos salida limpia y avisamos
      if (
        err.message?.includes('401') || 
        err.message?.includes('Invalid Credentials') ||
        err.status === 401
      ) {
        handleLogout();
        setModalMessage({
          show: true,
          title: 'Sesión expirada',
          message: 'Tu sesión de Google ha caducado por seguridad. Por favor vuelve a conectar.',
          type: 'warning'
        });
      } else {
        console.warn('⚠️ Trabajando con datos locales (offline mode activo)');
      }
    } finally {
      setLoading(false); // 💡 Nos aseguramos de apagar el loading sí o sí
    }
  }

  // Escuchar cambios de conectividad de red
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      console.log('🌐 Conexión a internet restablecida.');
      const savedToken = localStorage.getItem('google_access_token');
      if (savedToken && spreadsheetId) {
        await processSyncQueue(savedToken, spreadsheetId);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.warn('🔌 Sin conexión a internet. Cambiando a modo local.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [spreadsheetId]);

  useEffect(() => {
    initGoogleAuth(async (accessToken) => {
      setToken(accessToken);
      const expiresAt = Date.now() + 3600 * 1000;
      localStorage.setItem('google_access_token', accessToken);
      localStorage.setItem('google_token_expiry', expiresAt);

      setShowBetaModal(true);
      await initializeUserData(accessToken);
    });

    const savedToken = localStorage.getItem('google_access_token');
    const tokenExpiry = localStorage.getItem('google_token_expiry');

    if (savedToken && tokenExpiry) {
      // Usamos queueMicrotask para evitar el aviso de setState sincrónico en useEffect
      queueMicrotask(() => {
        if (Date.now() > parseInt(tokenExpiry, 10)) {
          console.warn('⚠️ El token de Google ha expirado. Cerrando sesión...');
          handleLogout();
        } else {
          initializeUserData(savedToken);
        }
      });
    }
  }, []);

  const calcularHorasAutomáticas = () => {
    if (!horaEntrada || !horaSalida) return '';
    const [hE, mE] = horaEntrada.split(':').map(Number);
    const [hS, mS] = horaSalida.split(':').map(Number);

    let ent = hE + mE / 60;
    let sal = hS + mS / 60;

    if (sal < ent) sal += 24;

    const diff = Math.max(0, sal - ent);
    return diff > 0 ? diff.toFixed(2) : '';
  };

  const horasTrabajadas = calcularHorasAutomáticas();

  const handleRefresh = async () => {
    if (!token || !spreadsheetId || !navigator.onLine) return;
    setLoading(true);
    try {
      const data = await getSheetData(token, spreadsheetId);
      updateRowsStateAndCache(data);
    } catch (err) {
      console.error('ERROR EN TERMINAL (Refresh Data):', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para comprobar conexión manualmente desde el botón del Navbar con modal personalizado
  const handleCheckConnectionAndSync = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setModalMessage({
        show: true,
        title: 'Sin conexión',
        message: 'No hay conexión a internet en este momento. Trabajando en modo local.',
        type: 'warning'
      });
      return;
    }

    setIsOnline(true);
    setLoading(true);
    try {
      const savedToken = localStorage.getItem('google_access_token') || token;
      if (!savedToken) {
        setModalMessage({
          show: true,
          title: 'Sesión expirada',
          message: 'Tu sesión no fue encontrada o ha expirado. Por favor inicia sesión de nuevo.',
          type: 'error'
        });
        return;
      }

      // Si por alguna razón el spreadsheetId no está en el estado, lo obtenemos o creamos
      let currentSheetId = spreadsheetId;
      if (!currentSheetId) {
        currentSheetId = await getOrCreateSpreadsheet(savedToken);
        setSpreadsheetId(currentSheetId);
      }

      // Procesar pendientes y refrescar datos
      await processSyncQueue(savedToken, currentSheetId);
      const freshData = await getSheetData(savedToken, currentSheetId);
      updateRowsStateAndCache(freshData);

      console.log('✅ Conexión con Drive comprobada y datos actualizados.');
      setModalMessage({
        show: true,
        title: 'Sincronización exitosa',
        message: '¡Conexión con Google Drive comprobada y datos actualizados correctamente!',
        type: 'success'
      });
    } catch (err) {
      console.error('❌ Error al comprobar la conexión con Drive:', err);
      setModalMessage({
        show: true,
        title: 'Error de conexión',
        message: 'Hubo un problema al conectar con Google Drive. Revisa tu conexión o vuelve a iniciar sesión.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fecha || !horaEntrada || !horaSalida || !horasTrabajadas) return;

    setLoading(true);

    const newRow = [
      fecha,
      horaEntrada,
      horaSalida,
      `${horasTrabajadas} hrs`,
    ];

    // Actualización optimista local inmediata
    const updatedRowsLocal = [newRow, ...rows];
    updateRowsStateAndCache(updatedRowsLocal);
    setHoraEntrada('');
    setHoraSalida('');

    if (navigator.onLine && token && spreadsheetId) {
      try {
        await addRowToSheet(token, spreadsheetId, newRow);
        await handleRefresh();
      } catch (error) {
        console.error('DETALLE TÉCNICO EN TERMINAL (Add Row - Guardado en cola):', error);
        enqueueSyncAction('ADD', newRow);
      }
    } else {
      enqueueSyncAction('ADD', newRow);
    }
    setLoading(false);
  };

  const handleUpdateRow = async (index, updatedRow) => {
    setLoading(true);

    const updatedRowsLocal = rows.map((r, i) => (i === index ? updatedRow : r));
    updateRowsStateAndCache(updatedRowsLocal);

    if (navigator.onLine && token && spreadsheetId) {
      try {
        await updateRowInSheet(token, spreadsheetId, index, updatedRow);
        await handleRefresh();
      } catch (error) {
        console.error('DETALLE TÉCNICO EN TERMINAL (Update Row - Guardado en cola):', error);
        enqueueSyncAction('UPDATE', { index, updatedRow });
      }
    } else {
      enqueueSyncAction('UPDATE', { index, updatedRow });
    }
    setLoading(false);
  };

  const handleDeleteRow = async (index) => {
    setLoading(true);

    const updatedRowsLocal = rows.filter((_, i) => i !== index);
    updateRowsStateAndCache(updatedRowsLocal);

    if (navigator.onLine && token && spreadsheetId) {
      try {
        await deleteRowFromSheet(token, spreadsheetId, index);
        await handleRefresh();
      } catch (error) {
        console.error('DETALLE TÉCNICO EN TERMINAL (Delete Row - Guardado en cola):', error);
        enqueueSyncAction('DELETE', { index });
      }
    } else {
      enqueueSyncAction('DELETE', { index });
    }
    setLoading(false);
  };

  return {
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
    modalMessage,       // <-- Exportado para el NotificationModal en App.jsx
    setModalMessage,    // <-- Exportado para cerrar/abrir el modal
    isOnline,
    requestAccessToken,
    handleRefresh,
    handleCheckConnectionAndSync,
    handleSubmit,
    handleUpdateRow,
    handleDeleteRow,
    handleLogout,
  };
} 