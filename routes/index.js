const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const courseRoutes = require('./course');
const bookingRoutes = require('./booking');
const adminRoutes = require('./admin');
const CourseModel = require('../models/course');
const ClassModel = require('../models/class');
const auth = require('../middleware/auth');
const BookingController = require('../controllers/bookingController');

// Attach user to all responses
router.use(auth.attachUser);

// Include other route modules
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);

// Home page
router.get('/', async (req, res, next) => {
  try {
    // Get featured courses
    const courses = await CourseModel.findAll();
    
    // Get upcoming classes
    const upcomingClasses = await ClassModel.findUpcoming(6);
    
    // Get course details for each upcoming class
    const upcomingClassesWithCourses = await Promise.all(upcomingClasses.map(async (cls) => {
      const course = await CourseModel.findById(cls.courseId);
      const formattedClass = ClassModel.formatClassTimes(cls);
      
      return {
        ...formattedClass,
        course
      };
    }));
    
    res.render('index', {
      title: 'Dance Class Booking',
      courses: courses.slice(0, 3), // Just show top 3 courses
      upcomingClasses: upcomingClassesWithCourses
    });
  } catch (error) {
    next(error);
  }
});

// User Dashboard
router.get('/dashboard', auth.authenticate, async (req, res, next) => {
  try {
    // If user is admin, redirect to admin dashboard
    if (req.userRole === 'admin') {
      return res.redirect('/admin');
    }
    
    // Get user's bookings with details
    const bookings = await BookingController.getUserBookings(req, res, next);
    
    // Get upcoming classes
    const upcomingClasses = await ClassModel.findUpcoming(4);
    
    // Get course details for each upcoming class
    const upcomingClassesWithCourses = await Promise.all(upcomingClasses.map(async (cls) => {
      const course = await CourseModel.findById(cls.courseId);
      const formattedClass = ClassModel.formatClassTimes(cls);
      
      return {
        ...formattedClass,
        course
      };
    }));
    
    res.render('dashboard/user', {
      title: 'My Dashboard',
      bookings,
      upcomingClasses: upcomingClassesWithCourses
    });
  } catch (error) {
    next(error);
  }
});

// Error pages for testing
if (process.env.NODE_ENV === 'development') {
  router.get('/test/404', (req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
  });
  
  router.get('/test/error', (req, res, next) => {
    next(new Error('Test error'));
  });
}

module.exports = router;