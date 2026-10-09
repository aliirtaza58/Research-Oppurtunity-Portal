const { test } = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../server');
const db = require('../config/db');

const sample = {
  title: 'AI in Healthcare',
  description: 'Research machine learning methods for medical data.',
  research_area: 'Machine Learning',
  faculty_name: 'Dr. Ahmed Khan',
  department: 'Computer Science',
  required_skills: 'Python, Data Analysis',
  available_positions: 3,
  application_deadline: '2030-12-31',
  status: 'Open'
};

test('Research portal uses MySQL for the complete CRUD and validation flow', async t => {
  const server = await new Promise(resolve => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  let poolClosed = false;
  t.after(async () => {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    if (!poolClosed) await db.end();
  });
  const request = async (method, route, body, raw = false) => {
    const response = await fetch(`${base}${route}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : raw ? body : JSON.stringify(body)
    });
    return { status: response.status, json: await response.json() };
  };
  const route = '/api/opportunities';
  const ids = [];
  await t.test('frontend and database health are served', async () => {
    const page = await fetch(`${base}/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /All Research Opportunities/);
    assert.equal((await fetch(`${base}/js/common.js`)).status, 200);
    const health = await request('GET', '/api/health');
    assert.equal(health.status, 200);
    assert.equal(health.json.database, 'connected');
  });
  await t.test('empty database returns an empty array', async () => {
    const response = await request('GET', route);
    assert.equal(response.status, 200);
    assert.deepEqual(response.json.data, []);
  });
  await t.test('create three opportunities and verify persistence in MySQL', async () => {
    for (let i = 0; i < 3; i++) {
      const response = await request('POST', route, { ...sample, title: `${sample.title} ${i}` });
      assert.equal(response.status, 201);
      assert.equal(response.json.data.application_deadline, sample.application_deadline);
      ids.push(response.json.data.id);
    }
    assert.equal(new Set(ids).size, 3);
    const [rows] = await db.query('SELECT id FROM opportunities');
    assert.equal(rows.length, 3);
  });
  await t.test('list all and retrieve the complete details of one', async () => {
    const list = await request('GET', route);
    assert.equal(list.status, 200);
    assert.equal(list.json.count, 3);
    const one = await request('GET', `${route}/${ids[0]}`);
    assert.equal(one.status, 200);
    for (const field of Object.keys(sample)) assert.ok(Object.hasOwn(one.json.data, field));
  });
  await t.test('update fields and close without changing other fields or the deadline', async () => {
    const update = await request('PUT', `${route}/${ids[0]}`, { title: 'AI in Healthcare Updated', available_positions: 2, required_skills: 'Python, TensorFlow' });
    assert.equal(update.status, 200);
    assert.equal(update.json.data.available_positions, 2);
    const close = await request('PUT', `${route}/${ids[0]}`, { status: 'Closed' });
    assert.equal(close.status, 200);
    assert.equal(close.json.data.status, 'Closed');
    assert.equal(close.json.data.title, 'AI in Healthcare Updated');
    assert.equal(close.json.data.application_deadline, '2030-12-31');
    const [rows] = await db.execute('SELECT status, title FROM opportunities WHERE id = ?', [ids[0]]);
    assert.equal(rows[0].status, 'Closed');
  });
  await t.test('delete and return 404 when retrieving, updating, or deleting it again', async () => {
    assert.equal((await request('DELETE', `${route}/${ids[2]}`)).status, 200);
    assert.equal((await request('GET', `${route}/${ids[2]}`)).status, 404);
    assert.equal((await request('PUT', `${route}/${ids[2]}`, { status: 'Closed' })).status, 404);
    assert.equal((await request('DELETE', `${route}/${ids[2]}`)).status, 404);
  });
  await t.test('reject missing, wrong-type, blank, fractional, invalid date, and invalid status inputs', async () => {
    const invalid = [
      {}, null, [], { ...sample, title: 123 }, { ...sample, title: '   ' },
      { ...sample, available_positions: 0 }, { ...sample, available_positions: 1.5 },
      { ...sample, available_positions: '3' }, { ...sample, available_positions: 2147483648 },
      { ...sample, application_deadline: '2030-02-30' },
      { ...sample, application_deadline: '2030-12-31T00:00:00Z' },
      { ...sample, status: 'Pending' }, { ...sample, faculty_name: 'x'.repeat(101) },
      { ...sample, unexpected: true }
    ];
    for (const payload of invalid) {
      assert.equal((await request('POST', route, payload)).status, 400, JSON.stringify(payload));
    }
    for (const payload of [{}, { title: '' }, { title: null }, { status: 'Pending' }, { available_positions: 0 }, { application_deadline: '2030-02-30' }]) {
      assert.equal((await request('PUT', `${route}/${ids[0]}`, payload)).status, 400);
    }
    assert.equal((await request('POST', route, '{broken', true)).status, 400);
    for (const method of ['GET', 'PUT', 'DELETE']) {
      assert.equal((await request(method, `${route}/abc`, method === 'PUT' ? { status: 'Closed' } : undefined)).status, 400);
    }
    assert.equal((await request('GET', '/api/does-not-exist')).status, 404);
    assert.equal((await request('GET', route)).json.count, 2);
  });
  await t.test('preserve text as data and accept a real leap day with a default Open status', async () => {
    const payload = { ...sample, title: '<img src=x onerror=alert(1)>', application_deadline: '2032-02-29' };
    delete payload.status;
    const response = await request('POST', route, payload);
    assert.equal(response.status, 201);
    assert.equal(response.json.data.title, payload.title);
    assert.equal(response.json.data.status, 'Open');
    assert.equal(response.json.data.application_deadline, '2032-02-29');
  });
  await t.test('database failure returns a JSON 500 response', async () => {
    await db.end();
    poolClosed = true;
    const response = await request('GET', route);
    assert.equal(response.status, 500);
    assert.equal(response.json.success, false);
    assert.equal(response.json.message, 'Internal server error');
  });
});