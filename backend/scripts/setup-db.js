const { adminConnection, installSchema } = require('./database');
(async () => {
  let connection;
  try {
    connection = await adminConnection();
    await installSchema(connection, process.env.DB_NAME || 'research_portal');
    console.log('Database and opportunities table ready. Existing rows were preserved.');
  } catch (error) {
    console.error(`Database setup failed (${error.code || error.message}). Check XAMPP MySQL and backend/.env.`);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
  }
})();