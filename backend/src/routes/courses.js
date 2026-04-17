const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');

const router = express.Router();

router.use(protect);
router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', adminOnly, createCourse);
router.put('/:id', adminOnly, updateCourse);
router.delete('/:id', adminOnly, deleteCourse);

module.exports = router;
