const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const {
  getStudents, getStudentStats, getStudent,
  createStudent, updateStudent, deleteStudent,
} = require('../controllers/studentController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStudentStats);
router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudent).put(updateStudent).delete(deleteStudent);

module.exports = router;
