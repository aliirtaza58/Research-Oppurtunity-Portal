const fs = require('node:fs');
const path = require('node:path');
const sample = {
  title: 'API Demo: AI in Healthcare',
  description: 'Research machine learning methods for medical data.',
  research_area: 'Machine Learning',
  faculty_name: 'Dr. Ahmed Khan',
  department: 'Computer Science',
  required_skills: 'Python, Data Analysis',
  available_positions: 3,
  application_deadline: '2030-12-31',
  status: 'Open'
};

function item(name, method, suffix, body, status, checks = []) {
  const request = {
    method,
    header: body === undefined ? [] : [{ key: 'Content-Type', value: 'application/json' }],
    url: `{{baseUrl}}/api/opportunities${suffix}`
  };
  if (body !== undefined) request.body = { mode: 'raw', raw: JSON.stringify(body, null, 2), options: { raw: { language: 'json' } } };
  return {
    name,
    request,
    event: [{
      listen: 'test',
      script: { type: 'text/javascript', exec: [
        `pm.test('HTTP ${status}', function () { pm.response.to.have.status(${status}); });`,
        'const json = pm.response.json();',
        `pm.test('success flag', function () { pm.expect(json.success).to.eql(${status < 400}); });`,
        ...checks
      ] }
    }],
    response: []
  };
}
const saveId = variable => [
  `if (pm.response.code === 201) pm.collectionVariables.set('${variable}', json.data.id);`,
  "pm.test('Generated unique ID', function () { pm.expect(json.data.id).to.be.a('number').and.above(0); });"
];
const collection = {
  info: {
    name: 'Research Opportunity Portal - Assignment 1',
    description: 'Run requests 01-11 in order. Creates three MySQL-backed records, lists them, retrieves one, updates it, closes it, deletes the third record, and demonstrates 404 and 400 responses. IDs are captured automatically; no manual ID editing is needed. Two API Demo records remain for the video. Repeat runs create new demo records.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:5000', type: 'string' },
    { key: 'opportunity_id', value: '', type: 'string' },
    { key: 'second_opportunity_id', value: '', type: 'string' },
    { key: 'deleted_id', value: '', type: 'string' }
  ],
  item: [
    item('01 Create AI opportunity', 'POST', '', sample, 201, saveId('opportunity_id')),
    item('02 Create wireless networks opportunity', 'POST', '', {
      ...sample, title: 'API Demo: Wireless Sensor Networks', research_area: 'Computer Networks',
      description: 'Study routing and energy efficiency in sensor networks.',
      faculty_name: 'Dr. Sara Ali', required_skills: 'Networking, C++', available_positions: 2
    }, 201, saveId('second_opportunity_id')),
    item('03 Create computer vision opportunity', 'POST', '', {
      ...sample, title: 'API Demo: Computer Vision', research_area: 'Computer Vision',
      description: 'Build image recognition models for university research.',
      faculty_name: 'Dr. Bilal Khan', required_skills: 'Python, OpenCV', available_positions: 1
    }, 201, saveId('deleted_id')),
    item('04 Retrieve all opportunities', 'GET', '', undefined, 200, [
      "pm.test('Contains all three newly created opportunities', function () {",
      "  const ids = json.data.map(function (row) { return row.id; });",
      "  ['opportunity_id', 'second_opportunity_id', 'deleted_id'].forEach(function (key) { pm.expect(ids).to.include(Number(pm.collectionVariables.get(key))); });",
      '});'
    ]),
    item('05 Retrieve one opportunity', 'GET', '/{{opportunity_id}}', undefined, 200, [
      "pm.test('Complete opportunity details', function () { pm.expect(json.data).to.have.all.keys('id', 'title', 'description', 'research_area', 'faculty_name', 'department', 'required_skills', 'available_positions', 'application_deadline', 'status', 'created_at'); });"
    ]),
    item('06 Update an opportunity', 'PUT', '/{{opportunity_id}}', {
      title: 'API Demo: AI in Healthcare Updated', required_skills: 'Python, TensorFlow, Data Analysis', available_positions: 2
    }, 200, [
      "pm.test('Updated fields persisted', function () { pm.expect(json.data.title).to.eql('API Demo: AI in Healthcare Updated'); pm.expect(json.data.available_positions).to.eql(2); });"
    ]),
    item('07 Change Open to Closed', 'PUT', '/{{opportunity_id}}', { status: 'Closed' }, 200, [
      "pm.test('Status is Closed and deadline is preserved', function () { pm.expect(json.data.status).to.eql('Closed'); pm.expect(json.data.application_deadline).to.eql('2030-12-31'); });"
    ]),
    item('08 Delete the third opportunity', 'DELETE', '/{{deleted_id}}', undefined, 200),
    item('09 Retrieve deleted opportunity - 404', 'GET', '/{{deleted_id}}', undefined, 404, [
      "pm.test('Not found message', function () { pm.expect(json.message).to.include('not found'); });"
    ]),
    item('10 Missing required data - 400', 'POST', '', { title: 'Incomplete opportunity' }, 400, [
      "pm.test('Validation errors returned', function () { pm.expect(json.errors).to.be.an('array').that.is.not.empty; });"
    ]),
    item('11 Invalid update - 400', 'PUT', '/{{second_opportunity_id}}', { status: 'Pending', available_positions: 0 }, 400)
  ]
};
fs.writeFileSync(path.join(__dirname, '../../postman/research-portal.postman_collection.json'), JSON.stringify(collection, null, 2) + '\n');
console.log('Exported 11 ordered Postman requests with response assertions and automatic IDs.');