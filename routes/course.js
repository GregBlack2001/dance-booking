const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/courseController');
const ClassController = require('../controllers/classController');

// View all courses
router.get('/', CourseController.listCourses);

// View course details
router.get('/:id', CourseController.getCourseDetails);

// View class details
router.get('/class/:id', ClassController.getClassDetails);

// View upcoming classes
router.get('/upcoming/classes', ClassController.listUpcomingClasses);

// API Endpoints
router.get('/api/all', CourseController.apiGetCourses);
router.get('/api/:id', CourseController.apiGetCourse);
router.get('/api/:id/classes', ClassController.apiGetClassesByCourse);

module.exports = router;