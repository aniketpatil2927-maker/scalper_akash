import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbHost = (process.env.DB_HOST || '127.0.0.1').trim();
const dbPort = parseInt((process.env.DB_PORT || '3306').trim(), 10);
const dbUser = (process.env.DB_USER || 'root').trim();
const dbPassword = (process.env.DB_PASSWORD || process.env.DB_PASS || '').trim();
const dbName = (process.env.DB_NAME || process.env.DB_DATABASE || 'two_trade_db').trim();

console.log(`Initializing Sequelize for database '${dbName}' as user '${dbUser}' at ${dbHost}:${dbPort}...`);
if (!dbPassword) {
  console.warn('⚠️ WARNING: DB_PASSWORD is empty or not set in environment variables!');
} else {
  console.log(`✓ DB password received (${dbPassword.length} characters)`);
}

const isSsl = process.env.DB_SSL === 'true' || 
              process.env.DB_SSL === '1' || 
              dbHost.includes('tidbcloud.com');

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: isSsl ? {
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    },
  } : undefined,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});
