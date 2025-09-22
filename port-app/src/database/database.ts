import { Sequelize } from 'sequelize';
import path from 'path';
import { app } from 'electron';

// This creates the database file in a standard, safe location for app data.
const storage = path.join(app.getPath('userData'), 'deport_database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storage,
  logging: console.log, // Logs SQL queries to the console. Remove for production.
});

export default sequelize;