const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { adminConnection, installSchema } = require('./database');

(async () => {
  const name = `research_portal_test_${randomBytes(6).toString('hex')}`;
  let connection;
  try {
    connection = await adminConnection();
    await installSchema(connection, name);
    const result = spawnSync(process.execPath, ['--test', path.join(__dirname, '../test/portal.test.js')], {
      stdio: 'inherit',
      windowsHide: true,
      env: { ...process.env, DB_NAME: name }
    });
    if (result.error) throw result.error;
    process.exitCode = result.status === 0 ? 0 : 1;
  } catch (error) {
    console.error(`Integration test setup failed (${error.code || error.message}). Start MySQL and configure backend/.env.`);
    process.exitCode = 1;
  } finally {
    if (connection) {
      // name is generated above, never taken from DB_NAME or a user argument.
      await connection.query(`DROP DATABASE IF EXISTS \`${name}\``);
      await connection.end();
    }
  }
})();