const Datastore = require('nedb');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Create the classes collection
const db = new Datastore({
  filename: path.join(process.env.DB_PATH || './data', 'classes.db'),
  autoload: true
});

// Create indexes
db.ensureIndex({ fieldName: 'courseId' });
db.ensureIndex({ fieldName: 'date' });

const ClassModel = {
  /**
   * Create a new class
   * @param {Object} classData - Class data
   * @returns {Promise<Object>} The created class
   */
  create(classData) {
    const classObj = {
      _id: uuidv4(),
      courseId: classData.courseId,
      title: classData.title,
      description: classData.description || '',
      date: new Date(classData.date),
      startTime: classData.startTime,
      endTime: classData.endTime,
      capacity: classData.capacity || 20,
      instructor: classData.instructor,
      location: classData.location,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      db.insert(classObj, (err, newClass) => {
        if (err) return reject(err);
        resolve(newClass);
      });
    });
  },

  /**
   * Find a class by ID
   * @param {string} id - The class ID
   * @returns {Promise<Object|null>} The found class or null
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      db.findOne({ _id: id }, (err, classObj) => {
        if (err) return reject(err);
        resolve(classObj);
      });
    });
  },

  /**
   * Get all classes
   * @returns {Promise<Array>} Array of classes
   */
  findAll() {
    return new Promise((resolve, reject) => {
      db.find({}).sort({ date: 1, startTime: 1 }).exec((err, classes) => {
        if (err) return reject(err);
        resolve(classes);
      });
    });
  },

  /**
   * Get classes by course ID
   * @param {string} courseId - The course ID
   * @returns {Promise<Array>} Array of classes
   */
  findByCourse(courseId) {
    return new Promise((resolve, reject) => {
      db.find({ courseId }).sort({ date: 1, startTime: 1 }).exec((err, classes) => {
        if (err) return reject(err);
        resolve(classes);
      });
    });
  },

  /**
   * Get upcoming classes
   * @param {number} limit - Maximum number of classes to return
   * @returns {Promise<Array>} Array of upcoming classes
   */
  findUpcoming(limit = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return new Promise((resolve, reject) => {
      db.find({ date: { $gte: today } })
        .sort({ date: 1, startTime: 1 })
        .limit(limit)
        .exec((err, classes) => {
          if (err) return reject(err);
          resolve(classes);
        });
    });
  },

  /**
   * Update a class
   * @param {string} id - The class ID
   * @param {Object} classData - Updated class data
   * @returns {Promise<Object>} The updated class
   */
  update(id, classData) {
    const updateData = {
      ...classData,
      updatedAt: new Date()
    };

    // If date is provided, ensure it's a Date object
    if (classData.date) {
      updateData.date = new Date(classData.date);
    }

    return new Promise((resolve, reject) => {
      db.update(
        { _id: id },
        { $set: updateData },
        { returnUpdatedDocs: true },
        (err, numAffected, updatedClass) => {
          if (err) return reject(err);
          if (numAffected === 0) return reject(new Error('Class not found'));
          resolve(updatedClass);
        }
      );
    });
  },

  /**
   * Delete a class
   * @param {string} id - The class ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  delete(id) {
    return new Promise((resolve, reject) => {
      db.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) return reject(err);
        resolve(numRemoved > 0);
      });
    });
  },

  /**
   * Check if a class has available capacity
   * @param {string} classId - The class ID
   * @param {number} bookedCount - Number of bookings for this class
   * @returns {Promise<boolean>} True if capacity is available, false otherwise
   */
  async hasCapacity(classId, bookedCount) {
    try {
      const classObj = await this.findById(classId);
      if (!classObj) {
        throw new Error('Class not found');
      }
      return bookedCount < classObj.capacity;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Format class date and time for display
   * @param {Object} classObj - The class object
   * @returns {Object} Formatted class with date and time strings
   */
  formatClassTimes(classObj) {
    const formatted = { ...classObj };
    
    // Format date
    if (classObj.date) {
      formatted.dateFormatted = moment(classObj.date).format('dddd, MMMM D, YYYY');
    }
    
    // Format start and end times
    if (classObj.startTime && classObj.endTime) {
      formatted.timeRange = `${classObj.startTime} - ${classObj.endTime}`;
    }
    
    return formatted;
  }
};

module.exports = ClassModel;