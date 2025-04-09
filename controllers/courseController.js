const CourseModel = require('../models/course');
const ClassModel = require('../models/class');

const CourseController = {
  /**
   * Display list of all courses
   */
  listCourses: async (req, res, next) => {
    try {
      const courses = await CourseModel.findAll();
      res.render('courses/list', {
        title: 'Dance Courses',
        courses
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Display details of a specific course with its classes
   */
  getCourseDetails: async (req, res, next) => {
    try {
      const courseId = req.params.id;
      
      // Get course details
      const course = await CourseModel.findById(courseId);
      
      if (!course) {
        return res.status(404).render('404', {
          title: 'Course Not Found',
          message: 'The course you are looking for does not exist'
        });
      }
      
      // Get classes for this course
      const classes = await ClassModel.findByCourse(courseId);
      
      // Format class dates and times
      const formattedClasses = classes.map(cls => ClassModel.formatClassTimes(cls));
      
      res.render('courses/details', {
        title: course.title,
        course,
        classes: formattedClasses
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * API endpoint to get all courses
   */
  apiGetCourses: async (req, res, next) => {
    try {
      const courses = await CourseModel.findAll();
      res.json({ success: true, courses });
    } catch (error) {
      next(error);
    }
  },

  /**
   * API endpoint to get a specific course
   */
  apiGetCourse: async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const course = await CourseModel.findById(courseId);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      res.json({ success: true, course });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = CourseController;