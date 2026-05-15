const express = require('express');
const multer = require('multer');
const { protect, adminOnly } = require('../middlewares/auth');
const {
  getStudents, getStudentStats, getStudent,
  createStudent, updateStudent, deleteStudent,
  importStudents,
} = require('../controllers/studentController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for Excel imports
});

router.use(protect, adminOnly);

router.get('/stats', getStudentStats);
router.post('/import', upload.single('file'), importStudents);
router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudent).put(updateStudent).delete(deleteStudent);

module.exports = router;
