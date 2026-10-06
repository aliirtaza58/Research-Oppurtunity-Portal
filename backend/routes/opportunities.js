const express = require('express');
const router = express.Router();
const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunityController');
const { validateOpportunity, validateUpdate, validateId } = require('../middleware/validate');

router.param('id', validateId);
router.post('/', validateOpportunity, createOpportunity);
router.get('/', getAllOpportunities);
router.get('/:id', getOpportunityById);
router.put('/:id', validateUpdate, updateOpportunity);
router.delete('/:id', deleteOpportunity);

module.exports = router;