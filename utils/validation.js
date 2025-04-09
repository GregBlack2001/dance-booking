const validator = require('validator');

const validation = {
  /**
   * Validate user registration data
   * @param {Object} userData - User data to validate
   * @returns {Object} Validation result with errors
   */
  validateUser: (userData) => {
    const errors = {};
    
    // Validate name
    if (!userData.name || userData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Validate email
    if (!userData.email || !validator.isEmail(userData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!userData.password) {
      errors.password = 'Password is required';
    } else if (userData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    // Validate password confirmation
    if (userData.password !== userData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate course data
   * @param {Object} courseData - Course data to validate
   * @returns {Object} Validation result with errors
   */
  validateCourse: (courseData) => {
    const errors = {};
    
    // Validate title
    if (!courseData.title || courseData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    // Validate description
    if (!courseData.description || courseData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    // Validate level
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!courseData.level || !validLevels.includes(courseData.level)) {
      errors.level = 'Level must be beginner, intermediate, or advanced';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate class data
   * @param {Object} classData - Class data to validate
   * @returns {Object} Validation result with errors
   */
  validateClass: (classData) => {
    const errors = {};
    
    // Validate course ID
    if (!classData.courseId) {
      errors.courseId = 'Course is required';
    }
    
    // Validate title
    if (!classData.title || classData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    // Validate date
    if (!classData.date) {
      errors.date = 'Date is required';
    } else if (!validator.isDate(classData.date, { format: 'YYYY-MM-DD' })) {
      errors.date = 'Invalid date format';
    }
    
    // Validate times
    if (!classData.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!classData.endTime) {
      errors.endTime = 'End time is required';
    }
    
    // Validate instructor
    if (!classData.instructor || classData.instructor.trim().length < 2) {
      errors.instructor = 'Instructor name is required';
    }
    
    // Validate location
    if (!classData.location || classData.location.trim().length < 2) {
      errors.location = 'Location is required';
    }
    
    // Validate capacity
    if (classData.capacity && (!Number.isInteger(Number(classData.capacity)) || Number(classData.capacity) <= 0)) {
      errors.capacity = 'Capacity must be a positive integer';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

module.exports = validation;