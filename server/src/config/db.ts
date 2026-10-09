
import mysql from 'mysql2/promise';
import { config } from './index';

const isLocalHost = config.db.host === 'localhost' || config.db.host === '127.0.0.1';
const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: false }
  : (process.env.DB_SSL === 'false' || isLocalHost ? undefined : { rejectUnauthorized: false });

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

