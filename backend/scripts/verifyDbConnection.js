const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verifyConnection() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'two_trade_db';
  const isSsl = process.env.DB_SSL === 'true' || 
                process.env.DB_SSL === '1' || 
                (Boolean(process.env.DB_HOST) && process.env.DB_HOST.includes('tidbcloud.com'));

  console.log('========================================================');
  console.log('  MYSQL / TIDB CLOUD REMOTE CONNECTION VERIFICATION');
  console.log('========================================================');
  console.log(`Host:     ${host}`);
  console.log(`Port:     ${port}`);
  console.log(`User:     ${user}`);
  console.log(`Database: ${database}`);
  console.log(`SSL:      ${isSsl ? 'ENABLED (TLS v1.2+)' : 'DISABLED'}`);
  console.log('--------------------------------------------------------');

  let connection;
  try {
    const connectionConfig = {
      host,
      port,
      user,
      password,
      database,
      ssl: isSsl ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      } : undefined,
      connectTimeout: 15000,
    };

    console.log('1. Attempting connection...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('   [SUCCESS] Connected to database server successfully!');

    console.log('2. Querying database version...');
    const [versionRows] = await connection.query('SELECT VERSION() as version, DATABASE() as current_db;');
    console.log(`   [SUCCESS] Engine Version: ${versionRows[0].version}`);
    console.log(`   [SUCCESS] Active Database: ${versionRows[0].current_db}`);

    console.log('3. Inspecting existing tables...');
    const [tables] = await connection.query('SHOW TABLES;');
    const tableNames = tables.map(r => Object.values(r)[0]);
    console.log(`   [SUCCESS] Found ${tableNames.length} tables in database '${database}'`);
    if (tableNames.length > 0) {
      console.log(`   Tables preview: ${tableNames.slice(0, 10).join(', ')}${tableNames.length > 10 ? '...' : ''}`);
    }

    console.log('4. Performing CRUD verification test...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS __deployment_test (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_key VARCHAR(100) NOT NULL,
        test_val VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // INSERT
    const [insertResult] = await connection.query(
      'INSERT INTO __deployment_test (test_key, test_val) VALUES (?, ?)',
      ['connection_check', 'ok']
    );
    const testId = insertResult.insertId;
    console.log(`   [SUCCESS] INSERT passed (id: ${testId})`);

    // SELECT
    const [selectRows] = await connection.query(
      'SELECT * FROM __deployment_test WHERE id = ?',
      [testId]
    );
    if (!selectRows || selectRows.length === 0) {
      throw new Error('SELECT failed to retrieve inserted row');
    }
    console.log(`   [SUCCESS] SELECT passed`);

    // UPDATE
    await connection.query(
      'UPDATE __deployment_test SET test_val = ? WHERE id = ?',
      ['updated_ok', testId]
    );
    console.log(`   [SUCCESS] UPDATE passed`);

    // DELETE
    await connection.query('DELETE FROM __deployment_test WHERE id = ?', [testId]);
    console.log(`   [SUCCESS] DELETE passed`);

    // CLEANUP
    await connection.query('DROP TABLE IF EXISTS __deployment_test;');
    console.log(`   [SUCCESS] Cleanup passed`);

    console.log('--------------------------------------------------------');
    console.log('  ALL DATABASE REMOTE CONNECTION & CRUD TESTS PASSED!');
    console.log('========================================================');
    process.exit(0);

  } catch (err) {
    console.error('--------------------------------------------------------');
    console.error('  [FAILED] DATABASE VERIFICATION ENCOUNTERED ERROR:');
    console.error(`  ${err.message}`);
    console.error('--------------------------------------------------------');
    console.error('Troubleshooting tips:');
    console.error('1. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
    console.error('2. For TiDB Cloud, ensure port is 4000 and SSL is supported');
    console.error('3. Verify TiDB Cloud IP Access List allows 0.0.0.0/0 (all IPs) or Render IPs');
    console.error('========================================================');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyConnection();
