const TEXT_FIELDS = {
  title: 255,
  description: null,
  research_area: 100,
  faculty_name: 100,
  department: 100,
  required_skills: null
};
const FIELDS = [...Object.keys(TEXT_FIELDS), 'available_positions', 'application_deadline', 'status'];

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number(value.slice(0, 4)) >= 1000 && !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
}

function validateBody(body, partial = false) {
  const errors = [];
  const data = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Request body must be a JSON object'], data };
  }
  const keys = Object.keys(body);
  const unknown = keys.filter(key => !FIELDS.includes(key));
  if (unknown.length) errors.push(`Unknown fields: ${unknown.join(', ')}`);
  if (partial && !keys.some(key => FIELDS.includes(key))) {
    errors.push('Provide at least one opportunity field to update');
  }
  for (const [field, maxLength] of Object.entries(TEXT_FIELDS)) {
    if (partial && !Object.hasOwn(body, field)) continue;
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      errors.push(`${field} is required and must be a non-empty string`);
    } else if (maxLength && [...body[field].trim()].length > maxLength) {
      errors.push(`${field} must be at most ${maxLength} characters`);
    } else if (!maxLength && Buffer.byteLength(body[field].trim(), 'utf8') > 65535) {
      errors.push(`${field} is too long`);
    } else {
      data[field] = body[field].trim();
    }
  }
  if (!partial || Object.hasOwn(body, 'available_positions')) {
    if (!Number.isInteger(body.available_positions) || body.available_positions < 1 || body.available_positions > 2147483647) {
      errors.push('available_positions must be a positive integer');
    } else data.available_positions = body.available_positions;
  }
  if (!partial || Object.hasOwn(body, 'application_deadline')) {
    if (!isValidDate(body.application_deadline)) {
      errors.push('application_deadline must be a real date in YYYY-MM-DD format');
    } else data.application_deadline = body.application_deadline;
  }
  if (Object.hasOwn(body, 'status')) {
    if (!['Open', 'Closed'].includes(body.status)) errors.push('status must be Open or Closed');
    else data.status = body.status;
  } else if (!partial) data.status = 'Open';
  return { errors, data };
}

function validationMiddleware(partial) {
  return (req, res, next) => {
    const { errors, data } = validateBody(req.body, partial);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join('; '), errors });
    }
    req.body = data;
    next();
  };
}

function validateId(req, res, next, id) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) > 2147483647) {
    return res.status(400).json({ success: false, message: 'Opportunity ID must be a positive integer' });
  }
  next();
}

module.exports = {
  validateOpportunity: validationMiddleware(false),
  validateUpdate: validationMiddleware(true),
  validateId,
  validateBody
};