const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runSqlFile(connection, filePath) {
  console.log(`Reading SQL file: ${filePath}`);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Remove single line comments starting with --
  const cleanSql = sql.replace(/--.*$/gm, '');

  const statements = cleanSql
    .split(/;\s*$/m)
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  for (let statement of statements) {
    if (statement.startsWith('/*') && statement.endsWith('*/')) continue;
    try {
      await connection.query(statement);
    } catch (err) {
      console.error(`Error executing statement: \n${statement}\nError: ${err.message}`);
      throw err;
    }
  }
}

async function setup() {
  const isSsl = process.env.DB_SSL === 'true' || 
                process.env.DB_SSL === '1' || 
                (Boolean(process.env.DB_HOST) && process.env.DB_HOST.includes('tidbcloud.com'));

  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    ssl: isSsl ? {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    } : undefined,
  };

  console.log(`Connecting to MySQL server at ${config.host}:${config.port} as ${config.user} (SSL: ${isSsl})...`);
  
  let connection;
  try {
    connection = await mysql.createConnection(config);
  } catch (err) {
    console.error(`Failed to connect to MySQL: ${err.message}`);
    console.error('Please verify that MySQL is running and your .env credentials are correct.');
    process.exit(1);
  }

  try {
    const dbName = process.env.DB_NAME || 'two_trade_db';
    console.log(`Ensuring database ${dbName} exists...`);
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    } catch (e) {
      console.warn(`Could not run CREATE DATABASE: ${e.message}. Proceeding to USE...`);
    }
    await connection.query(`USE \`${dbName}\`;`);

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    console.log('Running schema schema.sql...');
    await runSqlFile(connection, schemaPath);
    console.log('Schema created successfully!');

    console.log('Running seeds seed.sql...');
    await runSqlFile(connection, seedPath);
    console.log('Database seeded successfully!');

  } catch (err) {
    console.error('Error during database setup:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setup();
