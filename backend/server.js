const path = require('node:path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const opportunityRoutes = require('./routes/opportunities');
const db = require('./config/db');
const app = express();

app.use(cors());
app.use((req, res, next) => {
  const requestPath = req.path;
  res.on('finish', () => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${requestPath} ${res.statusCode}`);
  });
  next();
});
app.use(express.json({ limit: '256kb' }));
app.use('/api/opportunities', opportunityRoutes);
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ success: true, message: 'Research Opportunity Portal API is running.', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error.code);
    res.status(500).json({ success: false, message: 'Database connection unavailable' });
  }
});
app.use(express.static(path.join(__dirname, '../frontend')));
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body must contain valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(400).json({ success: false, message: 'Request body is too large' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

async function start() {
  const port = Number(process.env.PORT || 5000);
  try {
    await db.query('SELECT id FROM opportunities LIMIT 0');
    const server = app.listen(port, () => {
      console.log('MySQL connected; opportunities table ready.');
      console.log(`Server and frontend running on http://localhost:${port}`);
      console.log(`API: http://localhost:${port}/api/opportunities`);
    });
    server.on('error', async error => {
      console.error('Server could not start:', error.code);
      await db.end();
      process.exitCode = 1;
    });
    return server;
  } catch (error) {
    console.error(`Database setup failed (${error.code || 'connection error'}). Start MySQL, import database/schema.sql, and check backend/.env.`);
    await db.end();
    process.exitCode = 1;
  }
}

if (require.main === module) start();
module.exports = { app, start };