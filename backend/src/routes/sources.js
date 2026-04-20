const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');
const { 
  createSource, 
  getSources, 
  deleteSource 
} = require('../controllers/sourceController');

// GET /api/sources -> Admin & Student view sources
router.get('/', protect, getSources);

// POST /api/sources -> Admin uploads new study material
router.post('/', protect, adminOnly, upload.single('file'), createSource);

// DELETE /api/sources/:id -> Admin deletes study material
router.delete('/:id', protect, adminOnly, deleteSource);

module.exports = router;
