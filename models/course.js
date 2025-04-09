const Datastore = require('nedb');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create the courses collection
const db = new Datastore({
  filename: path.join(process.env.DB_PATH || './data', 'courses.db'),
  autoload: true
});

// Create indexes
db.ensureIndex({ fieldName: 'title', unique: true });

const CourseModel = {
  /**
   * Create a new course
   * @param {Object} courseData - Course data
   * @returns {Promise<Object>} The created course
   */
  create(courseData) {
    const course = {
      _id: uuidv4(),
      title: courseData.title,
      description: courseData.description,
      level: courseData.level || 'beginner', // beginner, intermediate, advanced
      imageUrl: courseData.imageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      db.insert(course, (err, newCourse) => {
        if (err) return reject(err);
        resolve(newCourse);
      });
    });
  },

  /**
   * Find a course by ID
   * @param {string} id - The course ID
   * @returns {Promise<Object|null>} The found course or null
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      db.findOne({ _id: id }, (err, course) => {
        if (err) return reject(err);
        resolve(course);
      });
    });
  },

  /**
   * Get all courses
   * @returns {Promise<Array>} Array of courses
   */
  findAll() {
    return new Promise((resolve, reject) => {
      db.find({}).sort({ title: 1 }).exec((err, courses) => {
        if (err) return reject(err);
        resolve(courses);
      });
    });
  },

  /**
   * Update a course
   * @param {string} id - The course ID
   * @param {Object} courseData - Updated course data
   * @returns {Promise<Object>} The updated course
   */
  update(id, courseData) {
    const updateData = {
      ...courseData,
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      db.update(
        { _id: id },
        { $set: updateData },
        { returnUpdatedDocs: true },
        (err, numAffected, updatedCourse) => {
          if (err) return reject(err);
          if (numAffected === 0) return reject(new Error('Course not found'));
          resolve(updatedCourse);
        }
      );
    });
  },

  /**
   * Delete a course
   * @param {string} id - The course ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  delete(id) {
    return new Promise((resolve, reject) => {
      db.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) return reject(err);
        resolve(numRemoved > 0);
      });
    });
  }
};

module.exports = CourseModel;