const BookingModel = require('../models/booking');
const ClassModel = require('../models/class');
const CourseModel = require('../models/course');

const BookingController = {
  /**
   * Create a new booking
   */
  createBooking: async (req, res, next) => {
    try {
      const { classId } = req.body;
      const userId = req.userId;
      
      // Check if class exists
      const classDetails = await ClassModel.findById(classId);
      if (!classDetails) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }
      
      // Check if user has already booked this class
      const hasBooked = await BookingModel.hasUserBooked(userId, classId);
      if (hasBooked) {
        return res.status(400).json({
          success: false,
          message: 'You have already booked this class'
        });
      }
      
      // Check if class has available capacity
      const bookingCount = await BookingModel.getBookingCount(classId);
      const hasCapacity = await ClassModel.hasCapacity(classId, bookingCount);
      
      if (!hasCapacity) {
        return res.status(400).json({
          success: false,
          message: 'This class is fully booked'
        });
      }
      
      // Create booking
      const booking = await BookingModel.create({ userId, classId });
      
      // Redirect to dashboard
      res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (req, res, next) => {
    try {
      const bookingId = req.params.id;
      
      // Get booking details
      const booking = await BookingModel.findById(bookingId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check if the booking belongs to the current user or if the user is an admin
      if (booking.userId !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to cancel this booking'
        });
      }
      
      // Cancel booking
      await BookingModel.cancel(bookingId);
      
      // Redirect to dashboard
      res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Display user's bookings in dashboard
   */
  getUserBookings: async (req, res, next) => {
    try {
      const userId = req.userId;
      
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
      
      // Filter out bookings with missing class or course (might have been deleted)
      const validBookings = bookingsWithDetails.filter(
        booking => booking.class && booking.course
      );
      
      return validBookings;
    } catch (error) {
      next(error);
    }
  },

  /**
   * API endpoint to get bookings for a class
   */
  apiGetClassBookings: async (req, res, next) => {
    try {
      // Check if user is admin
      if (req.userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      const classId = req.params.classId;
      const bookings = await BookingModel.findByClass(classId);
      
      res.json({ success: true, bookings });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = BookingController;