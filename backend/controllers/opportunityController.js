const db = require('../config/db');

// POST /api/opportunities — Create a new opportunity
const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      research_area,
      faculty_name,
      department,
      required_skills,
      available_positions,
      application_deadline,
      status = 'Open'
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO opportunities 
        (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status]
    );

    const [rows] = await db.execute('SELECT * FROM opportunities WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Research opportunity created successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('createOpportunity error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/opportunities — Retrieve all opportunities
const getAllOpportunities = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM opportunities ORDER BY created_at DESC, id DESC');
    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('getAllOpportunities error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/opportunities/:id — Retrieve one opportunity
const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM opportunities WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Opportunity with ID ${id} not found` });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('getOpportunityById error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/opportunities/:id — Update an opportunity
const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if exists
    const [existing] = await db.execute('SELECT * FROM opportunities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Opportunity with ID ${id} not found` });
    }

    const {
      title,
      description,
      research_area,
      faculty_name,
      department,
      required_skills,
      available_positions,
      application_deadline,
      status
    } = req.body;

    // Merge with existing values so partial updates work
    const current = existing[0];
    const updated = {
      title: title ?? current.title,
      description: description ?? current.description,
      research_area: research_area ?? current.research_area,
      faculty_name: faculty_name ?? current.faculty_name,
      department: department ?? current.department,
      required_skills: required_skills ?? current.required_skills,
      available_positions: available_positions ?? current.available_positions,
      application_deadline: application_deadline ?? current.application_deadline,
      status: status ?? current.status
    };

    await db.execute(
      `UPDATE opportunities SET
        title = ?, description = ?, research_area = ?, faculty_name = ?,
        department = ?, required_skills = ?, available_positions = ?,
        application_deadline = ?, status = ?
       WHERE id = ?`,
      [
        updated.title, updated.description, updated.research_area,
        updated.faculty_name, updated.department, updated.required_skills,
        updated.available_positions, updated.application_deadline, updated.status, id
      ]
    );

    const [rows] = await db.execute('SELECT * FROM opportunities WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Research opportunity updated successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('updateOpportunity error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/opportunities/:id — Delete an opportunity
const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.execute('SELECT * FROM opportunities WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Opportunity with ID ${id} not found` });
    }

    await db.execute('DELETE FROM opportunities WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: `Research opportunity with ID ${id} deleted successfully`
    });
  } catch (error) {
    console.error('deleteOpportunity error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity
};
