const express = require('express');
const multer = require('multer');
const { protect, adminOnly } = require('../middlewares/auth');
const {
  getStudents, getStudentStats, getStudent,
  createStudent, updateStudent, deleteStudent,
  importStudents,
} = require('../controllers/studentController');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.use(protect, adminOnly);

router.use((req, res, next) => {
  console.log(`[STUDENT ROUTE LOG] ${req.method} ${req.url}`);
  next();
});

router.get('/stats', getStudentStats);
router.post('/import', upload.single('file'), importStudents);
router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudent).put(updateStudent).delete(deleteStudent);

module.exports = router;
