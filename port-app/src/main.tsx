import { app, BrowserWindow } from 'electron';
import path from 'path';
import sequelize from './database/database';
import defineContainerModel from './database/models/Container';
import defineMovementModel from './database/models/Movement';
import defineInspectionPhotoModel from './database/models/InspectionPhoto';

// Initialize the models
defineContainerModel(sequelize);
defineMovementModel(sequelize);
defineInspectionPhotoModel(sequelize);

const { Container, Movement, InspectionPhoto } = sequelize.models;

Container.hasMany(Movement, { foreignKey: 'containerId' });
Movement.belongsTo(Container, { foreignKey: 'containerId' });

Movement.hasMany(InspectionPhoto, { foreignKey: 'movementId' });
InspectionPhoto.belongsTo(Movement, { foreignKey: 'movementId' });

async function initializeDatabase() {
  try {
    // Usar { force: true } temporalmente en desarrollo para que las tablas se actualicen
    await sequelize.sync({ force: true }); 
    console.log('Database synced successfully with new models and relationships.');
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
}

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