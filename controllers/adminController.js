const CourseModel = require('../models/course');
const ClassModel = require('../models/class');
const UserModel = require('../models/user');
const BookingModel = require('../models/booking');

const AdminController = {
  /**
   * Admin Dashboard
   */
  dashboard: async (req, res, next) => {
    try {
      // Get counts for dashboard stats
      const courses = await CourseModel.findAll();
      const classes = await ClassModel.findAll();
      const users = await UserModel.findAll();
      const bookings = await BookingModel.findAll();
      
      // Calculate active users (users with at least one booking)
      const userIds = new Set(bookings.map(booking => booking.userId));
      const activeUsers = userIds.size;
      
      // Get upcoming classes
      const upcomingClasses = await ClassModel.findUpcoming(5);
      
      // Get course details for each upcoming class
      const upcomingClassesWithCourses = await Promise.all(upcomingClasses.map(async (cls) => {
        const course = await CourseModel.findById(cls.courseId);
        const bookingCount = await BookingModel.getBookingCount(cls._id);
        const formattedClass = ClassModel.formatClassTimes(cls);
        
        return {
          ...formattedClass,
          course,
          bookingCount,
          capacity: cls.capacity
        };
      }));
      
      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        stats: {
          coursesCount: courses.length,
          classesCount: classes.length,
          usersCount: users.length,
          activeUsers,
          bookingsCount: bookings.length
        },
        upcomingClasses: upcomingClassesWithCourses
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Manage Courses
   */
  manageCourses: async (req, res, next) => {
    try {
      const courses = await CourseModel.findAll();
      res.render('admin/courses', {
        title: 'Manage Courses',
        courses
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Course Form (Create/Edit)
   */
  courseForm: async (req, res, next) => {
    try {
      const courseId = req.params.id;
      let course = null;
      
      if (courseId) {
        // Edit existing course
        course = await CourseModel.findById(courseId);
        if (!course) {
          return res.status(404).render('404', {
            title: 'Course Not Found',
            message: 'The course you are trying to edit does not exist'
          });
        }
      }
      
      res.render('admin/course-form', {
        title: course ? `Edit ${course.title}` : 'Create New Course',
        course
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Save Course (Create/Update)
   */
  saveCourse: async (req, res, next) => {
    try {
      const { _id, title, description, level, imageUrl } = req.body;
      
      // Validate input
      if (!title || !description || !level) {
        return res.render('admin/course-form', {
          title: _id ? 'Edit Course' : 'Create New Course',
          course: { _id, title, description, level, imageUrl },
          error: 'Title, description, and level are required'
        });
      }
      
      const courseData = {
        title,
        description,
        level,
        imageUrl: imageUrl || null
      };
      
      if (_id) {
        // Update existing course
        await CourseModel.update(_id, courseData);
      } else {
        // Create new course
        await CourseModel.create(courseData);
      }
      
      res.redirect('/admin/courses');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete Course
   */
  deleteCourse: async (req, res, next) => {
    try {
      const courseId = req.params.id;
      
      // Check if course exists
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Delete course
      await CourseModel.delete(courseId);
      
      // Return success response
      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Manage Classes
   */
  manageClasses: async (req, res, next) => {
    try {
      const courseId = req.query.courseId;
      let classes;
      let course = null;
      
      if (courseId) {
        // Get classes for specific course
        classes = await ClassModel.findByCourse(courseId);
        course = await CourseModel.findById(courseId);
      } else {
        // Get all classes
        classes = await ClassModel.findAll();
      }
      
      // Get course details for each class
      const classesWithCourses = await Promise.all(classes.map(async (cls) => {
        const courseInfo = course || await CourseModel.findById(cls.courseId);
        const bookingCount = await BookingModel.getBookingCount(cls._id);
        const formattedClass = ClassModel.formatClassTimes(cls);
        
        return {
          ...formattedClass,
          course: courseInfo,
          bookingCount
        };
      }));
      
      // Get all courses for filter dropdown
      const courses = await CourseModel.findAll();
      
      res.render('admin/classes', {
        title: course ? `Classes for ${course.title}` : 'Manage Classes',
        classes: classesWithCourses,
        courses,
        selectedCourse: courseId
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Class Form (Create/Edit)
   */
  classForm: async (req, res, next) => {
    try {
      const classId = req.params.id;
      const courseId = req.query.courseId;
      let classObj = null;
      let course = null;
      
      // Get all courses for dropdown
      const courses = await CourseModel.findAll();
      
      if (classId) {
        // Edit existing class
        classObj = await ClassModel.findById(classId);
        if (!classObj) {
          return res.status(404).render('404', {
            title: 'Class Not Found',
            message: 'The class you are trying to edit does not exist'
          });
        }
        course = await CourseModel.findById(classObj.courseId);
      } else if (courseId) {
        // New class for specific course
        course = await CourseModel.findById(courseId);
        if (!course) {
          return res.status(404).render('404', {
            title: 'Course Not Found',
            message: 'The course you are trying to add a class to does not exist'
          });
        }
      }
      
      res.render('admin/class-form', {
        title: classObj ? `Edit ${classObj.title}` : 'Create New Class',
        class: classObj,
        courses,
        selectedCourseId: course ? course._id : null
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Save Class (Create/Update)
   */
  saveClass: async (req, res, next) => {
    try {
      const { _id, courseId, title, description, date, startTime, endTime, capacity, instructor, location } = req.body;
      
      // Validate input
      if (!courseId || !title || !date || !startTime || !endTime || !instructor || !location) {
        // Get courses for form
        const courses = await CourseModel.findAll();
        
        return res.render('admin/class-form', {
          title: _id ? 'Edit Class' : 'Create New Class',
          class: { _id, courseId, title, description, date, startTime, endTime, capacity, instructor, location },
          courses,
          selectedCourseId: courseId,
          error: 'All fields except description are required'
        });
      }
      
      const classData = {
        courseId,
        title,
        description: description || '',
        date,
        startTime,
        endTime,
        capacity: capacity || 20,
        instructor,
        location
      };
      
      if (_id) {
        // Update existing class
        await ClassModel.update(_id, classData);
      } else {
        // Create new class
        await ClassModel.create(classData);
      }
      
      res.redirect(`/admin/classes?courseId=${courseId}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete Class
   */
  deleteClass: async (req, res, next) => {
    try {
      const classId = req.params.id;
      
      // Check if class exists
      const classObj = await ClassModel.findById(classId);
      if (!classObj) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }
      
      // Delete class
      await ClassModel.delete(classId);
      
      // Return success response
      res.json({
        success: true,
        message: 'Class deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Manage Users
   */
  manageUsers: async (req, res, next) => {
    try {
      const users = await UserModel.findAll();
      
      // Get booking counts for each user
      const usersWithBookings = await Promise.all(users.map(async (user) => {
        const bookings = await BookingModel.findByUser(user._id);
        return {
          ...user,
          bookingsCount: bookings.length
        };
      }));
      
      res.render('admin/users', {
        title: 'Manage Users',
        users: usersWithBookings
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * View User Details
   */
  viewUser: async (req, res, next) => {
    try {
      const userId = req.params.id;
      
      // Get user details
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).render('404', {
          title: 'User Not Found',
          message: 'The user you are looking for does not exist'
        });
      }
      
      // Get user's bookings
      const bookings = await BookingModel.findByUser(userId);
      
      // Get class and course details for each booking
      const bookingsWithDetails = await Promise.all(bookings.map(async (booking) => {
        const classDetails = await ClassModel.findById(booking.classId);
        const course = classDetails ? await CourseModel.findById(classDetails.courseId) : null;
        
        return {
          ...booking,
          class: classDetails ? ClassModel.formatClassTimes(classDetails) : null,
          course
        };
      }));
      
      // Filter out bookings with missing class or course
      const validBookings = bookingsWithDetails.filter(
        booking => booking.class && booking.course
      );
      
      res.render('admin/user-details', {
        title: `User: ${user.name}`,
        user,
        bookings: validBookings
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle User Admin Status
   */
  toggleAdminStatus: async (req, res, next) => {
    try {
      const userId = req.params.id;
      
      // Get user details
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Toggle admin status
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await UserModel.update(userId, { role: newRole });
      
      // Return success response
      res.json({
        success: true,
        message: `User is now ${newRole === 'admin' ? 'an admin' : 'a regular user'}`,
        role: newRole
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Class Participants
   */
  classParticipants: async (req, res, next) => {
    try {
      const classId = req.params.id;
      
      // Get class details
      const classObj = await ClassModel.findById(classId);
      if (!classObj) {
        return res.status(404).render('404', {
          title: 'Class Not Found',
          message: 'The class you are looking for does not exist'
        });
      }
      
      // Get course details
      const course = await CourseModel.findById(classObj.courseId);
      
      // Format class date and time
      const formattedClass = ClassModel.formatClassTimes(classObj);
      
      // Get bookings for this class
      const bookings = await BookingModel.findByClass(classId);
      
      // Get user details for each booking
      const participants = await Promise.all(bookings.map(async (booking) => {
        const user = await UserModel.findById(booking.userId);
        return {
          ...booking,
          user
        };
      }));
      
      res.render('admin/participants', {
        title: `Participants: ${classObj.title}`,
        class: formattedClass,
        course,
        participants,
        bookingCount: bookings.length,
        capacity: classObj.capacity
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AdminController;