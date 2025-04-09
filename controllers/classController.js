const ClassModel = require('../models/class');
const CourseModel = require('../models/course');
const BookingModel = require('../models/booking');

const ClassController = {
  /**
   * Display details of a specific class
   */
  getClassDetails: async (req, res, next) => {
    try {
      const classId = req.params.id;
      
      // Get class details
      const classDetails = await ClassModel.findById(classId);
      
      if (!classDetails) {
        return res.status(404).render('404', {
          title: 'Class Not Found',
          message: 'The class you are looking for does not exist'
        });
      }
      
      // Get course details
      const course = await CourseModel.findById(classDetails.courseId);
      
      if (!course) {
        return res.status(404).render('404', {
          title: 'Course Not Found',
          message: 'The course associated with this class does not exist'
        });
      }
      
      // Format class date and time
      const formattedClass = ClassModel.formatClassTimes(classDetails);
      
      // Check if user has already booked this class
      let userHasBooked = false;
      if (res.locals.user) {
        userHasBooked = await BookingModel.hasUserBooked(res.locals.user._id, classId);
      }
      
      // Get current booking count
      const bookingCount = await BookingModel.getBookingCount(classId);
      const spotsAvailable = classDetails.capacity - bookingCount;
      
      res.render('classes/details', {
        title: classDetails.title,
        class: formattedClass,
        course,
        userHasBooked,
        spotsAvailable,
        isFull: spotsAvailable <= 0
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Display all upcoming classes
   */
  listUpcomingClasses: async (req, res, next) => {
    try {
      const classes = await ClassModel.findUpcoming(20); // Get next 20 upcoming classes
      
      // Get course details for each class
      const classesWithCourses = await Promise.all(classes.map(async (cls) => {
        const course = await CourseModel.findById(cls.courseId);
        const formattedClass = ClassModel.formatClassTimes(cls);
        return {
          ...formattedClass,
          course
        };
      }));
      
      res.render('classes/upcoming', {
        title: 'Upcoming Classes',
        classes: classesWithCourses
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * API endpoint to get all classes
   */
  apiGetClasses: async (req, res, next) => {
    try {
      const classes = await ClassModel.findAll();
      res.json({ success: true, classes });
    } catch (error) {
      next(error);
    }
  },

  /**
   * API endpoint to get a specific class
   */
  apiGetClass: async (req, res, next) => {
    try {
      const classId = req.params.id;
      const classDetails = await ClassModel.findById(classId);
      
      if (!classDetails) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }
      
      res.json({ success: true, class: classDetails });
    } catch (error) {
      next(error);
    }
  },

  /**
   * API endpoint to get classes for a specific course
   */
  apiGetClassesByCourse: async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const classes = await ClassModel.findByCourse(courseId);
      
      res.json({ success: true, classes });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ClassController;