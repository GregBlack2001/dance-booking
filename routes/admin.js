const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Admin authentication middleware for all routes
router.use(auth.authenticate, auth.isAdmin);

// Admin dashboard
router.get('/', AdminController.dashboard);

// Courses management
router.get('/courses', AdminController.manageCourses);
router.get('/courses/new', AdminController.courseForm);
router.get('/courses/edit/:id', AdminController.courseForm);
router.post('/courses/save', AdminController.saveCourse);
router.delete('/courses/:id', AdminController.deleteCourse);

// Classes management
router.get('/classes', AdminController.manageClasses);
router.get('/classes/new', AdminController.classForm);
router.get('/classes/edit/:id', AdminController.classForm);
router.post('/classes/save', AdminController.saveClass);
router.delete('/classes/:id', AdminController.deleteClass);
router.get('/classes/:id/participants', AdminController.classParticipants);

// Users management
router.get('/users', AdminController.manageUsers);
router.get('/users/:id', AdminController.viewUser);
router.put('/users/:id/toggle-admin', AdminController.toggleAdminStatus);

module.exports = router;