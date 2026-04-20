const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');
const { 
  createAssignment, 
  getAdminAssignments, 
  getMyAssignments 
} = require('../controllers/assignmentController');

// GET /api/assignments/my -> Student views their own assignments
router.get('/my', protect, getMyAssignments);

// GET /api/assignments -> Admin views all assignments
router.get('/', protect, adminOnly, getAdminAssignments);

// POST /api/assignments -> Admin uploads new assignment
router.post('/', protect, adminOnly, upload.single('pdf'), createAssignment);

module.exports = router;
