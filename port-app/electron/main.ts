import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import {fileURLToPath } from 'url';
import sequelize from '../src/database/database';
import defineContainerModel from '../src/database/models/Container';
import defineMovementModel from '../src/database/models/Movement';
import defineInspectionPhotoModel from '../src/database/models/InspectionPhoto';
import { getDashboardStats, getContainersInYard, createMovement } from '../src/services';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define environment variables with fallbacks
const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';


// --- 1. Definición de Funciones ---

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    // In development, load from the dev server
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

async function initializeDatabase() {
  try {
    defineContainerModel(sequelize);
    defineMovementModel(sequelize);
    defineInspectionPhotoModel(sequelize);

    const { Container, Movement, InspectionPhoto } = sequelize.models;
    Container.hasMany(Movement, { foreignKey: 'containerId' });
    Movement.belongsTo(Container, { foreignKey: 'containerId' });
    Movement.hasMany(InspectionPhoto, { foreignKey: 'movementId' });
    InspectionPhoto.belongsTo(Movement, { foreignKey: 'movementId' });

    await sequelize.sync({ force: false });
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
}

// --- 2. Registro de Manejadores de IPC ---

ipcMain.handle('get-dashboard-stats', async () => getDashboardStats());
ipcMain.handle('get-containers-in-yard', async () => getContainersInYard());
ipcMain.handle('create-movement', async (_event, data) => {
  try {
    return await createMovement(data);
  } catch (error: any) {
    console.error('Error creating movement:', error);
    return { success: false, message: error.message };
  }
});

// --- 3. Ciclo de Vida de la Aplicación ---

app.whenReady().then(() => {
  initializeDatabase();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});