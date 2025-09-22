import { app, BrowserWindow } from 'electron';
import path from 'path';
import sequelize from './database/database';
import defineContainerModel from './database/models/Container';
import defineMovementModel from './database/models/Movement';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();
};

// --- Database Initialization ---

defineContainerModel(sequelize);
defineMovementModel(sequelize);

const { Container, Movement } = sequelize.models;
Container.hasMany(Movement, { foreignKey: 'containerId' });
// ----> CORRECCIÓN AQUÍ <----
Movement.belongsTo(Container, { foreignKey: 'containerId' });
// -------------------------

async function initializeDatabase() {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
}

app.on('ready', () => {
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