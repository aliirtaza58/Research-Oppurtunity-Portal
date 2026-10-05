const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const { readFile } = require('node:fs/promises');

async function adminConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });
}

async function installSchema(connection, name) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error('DB_NAME must contain only letters, numbers, and underscores');
  const schema = await readFile(path.join(__dirname, '../../database/schema.sql'), 'utf8');
  await connection.query(schema.replaceAll('research_portal', name));
}
module.exports = { adminConnection, installSchema };