const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// Solicitamos acceso exclusivo a los archivos creados por esta app en el Drive del usuario
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const SPREADSHEET_NAME = 'MiApp_BaseDeDatos';

let tokenClient = null;

// Inicializa el cliente OAuth 2.0
export const initGoogleAuth = (onSuccess) => {
  if (window.google) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          localStorage.setItem('google_access_token', response.access_token);
          onSuccess(response.access_token);
        }
      },
    });
  }
};

// Solicita el login / permisos al usuario
export const requestAccessToken = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    console.error('El cliente de Google Auth no se ha inicializado');
  }
};

// Busca si ya existe la hoja o la crea automáticamente en su Google Drive
export const getOrCreateSpreadsheet = async (accessToken) => {
  try {
    // 1. Buscar si ya existe la hoja 'MiApp_BaseDeDatos'
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id; // Retorna ID existente
    }

    // 2. Si no existe, crear una nueva hoja de cálculo
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: SPREADSHEET_NAME,
        mimeType: 'application/vnd.google-apps.spreadsheet',
      }),
    });
    const newFile = await createResponse.json();

    // 3. Inicializar los encabezados en la nueva hoja
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${newFile.id}/values/A1:D1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [['Fecha', 'Hora de Entrada', 'Hora de Salida', 'Horas Trabajadas por Día']],
        }),
      }
    );

    return newFile.id;
  } catch (error) {
    console.error('Error al obtener o crear la hoja de cálculo:', error);
    throw error;
  }
};

// Guardar un nuevo registro (Fila) en el Google Sheet del usuario
export const addRowToSheet = async (accessToken, spreadsheetId, rowData) => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error('ERROR DETALLADO EN TERMINAL (Google Sheets Append):', result);
    throw new Error(result.error?.message || 'Error al registrar la información en Google Sheets');
  }

  return result;
};

// Obtener los registros de la hoja
export const getSheetData = async (accessToken, spreadsheetId) => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:Z`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await response.json();
  
  // Opcional pero recomendado: si la primera fila es la cabecera, la removemos del array 'rows' 
  // para que el índice coincida limpiamente con tus registros de turnos.
  const rows = data.values || [];
  if (rows.length > 0 && rows[0][0] === 'Fecha') {
    rows.shift(); // Quitamos la cabecera para que rows[0] sea el primer registro real
  }
  return rows;
};

// Actualizar una fila existente en Google Sheets
export const updateRowInSheet = async (accessToken, spreadsheetId, rowIndex, updatedRowData) => {
  // Como la fila 1 es el encabezado y el array rows ya tiene la cabecera removida,
  // la fila real en Google Sheets es rowIndex + 2.
  const sheetRowNumber = rowIndex + 2;
  const range = `A${sheetRowNumber}:D${sheetRowNumber}`;

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [updatedRowData],
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error('ERROR DETALLADO EN TERMINAL (Google Sheets Update):', result);
    throw new Error(result.error?.message || 'Error al actualizar el registro en Google Sheets');
  }

  return result;
};

// Eliminar (limpiar) una fila existente en Google Sheets
export const deleteRowFromSheet = async (accessToken, spreadsheetId, rowIndex) => {
  const sheetRowNumber = rowIndex + 2;
  const range = `A${sheetRowNumber}:D${sheetRowNumber}`;

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error('ERROR DETALLADO EN TERMINAL (Google Sheets Delete):', result);
    throw new Error(result.error?.message || 'Error al eliminar el registro en Google Sheets');
  }

  return result;
};