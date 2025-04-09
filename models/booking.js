
const Datastore = require('nedb');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create the bookings collection
const db = new Datastore({
  filename: path.join(process.env.DB_PATH || './data', 'bookings.db'),
  autoload: true
});

// Create indexes
db.ensureIndex({ fieldName: 'classId' });
db.ensureIndex({ fieldName: 'userId' });
db.ensureIndex({ fieldName: 'userId_classId', unique: true });

const BookingModel = {
  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data (userId, classId)
   * @returns {Promise<Object>} The created booking
   */
  create(bookingData) {
    const booking = {
      _id: uuidv4(),
      userId: bookingData.userId,
      classId: bookingData.classId,
      status: 'confirmed', // confirmed, cancelled
      notes: bookingData.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      // First check if booking already exists
      db.findOne({ userId: booking.userId, classId: booking.classId }, (err, existingBooking) => {
        if (err) return reject(err);
        if (existingBooking) return reject(new Error('User has already booked this class'));
        
        // Insert new booking
        db.insert(booking, (err, newBooking) => {
          if (err) return reject(err);
          resolve(newBooking);
        });
      });
    });
  },

  /**
   * Find a booking by ID
   * @param {string} id - The booking ID
   * @returns {Promise<Object|null>} The found booking or null
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      db.findOne({ _id: id }, (err, booking) => {
        if (err) return reject(err);
        resolve(booking);
      });
    });
  },

  /**
   * Get all bookings
   * @returns {Promise<Array>} Array of bookings
   */
  findAll() {
    return new Promise((resolve, reject) => {
      db.find({}).sort({ createdAt: -1 }).exec((err, bookings) => {
        if (err) return reject(err);
        resolve(bookings);
      });
    });
  },

  /**
   * Get bookings by user ID
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of bookings
   */
  findByUser(userId) {
    return new Promise((resolve, reject) => {
      db.find({ userId }).sort({ createdAt: -1 }).exec((err, bookings) => {
        if (err) return reject(err);
        resolve(bookings);
      });
    });
  },

  /**
   * Get bookings by class ID
   * @param {string} classId - The class ID
   * @returns {Promise<Array>} Array of bookings
   */
  findByClass(classId) {
    return new Promise((resolve, reject) => {
      db.find({ classId }).exec((err, bookings) => {
        if (err) return reject(err);
        resolve(bookings);
      });
    });
  },

  /**
   * Check if a user has booked a specific class
   * @param {string} userId - The user ID
   * @param {string} classId - The class ID
   * @returns {Promise<boolean>} True if booked, false otherwise
   */
  hasUserBooked(userId, classId) {
    return new Promise((resolve, reject) => {
      db.findOne({ userId, classId }, (err, booking) => {
        if (err) return reject(err);
        resolve(!!booking);
      });
    });
  },

  /**
   * Get the number of bookings for a class
   * @param {string} classId - The class ID
   * @returns {Promise<number>} Number of bookings
   */
  getBookingCount(classId) {
    return new Promise((resolve, reject) => {
      db.count({ classId, status: 'confirmed' }, (err, count) => {
        if (err) return reject(err);
        resolve(count);
      });
    });
  },

  /**
   * Update a booking
   * @param {string} id - The booking ID
   * @param {Object} bookingData - Updated booking data
   * @returns {Promise<Object>} The updated booking
   */
  update(id, bookingData) {
    const updateData = {
      ...bookingData,
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      db.update(
        { _id: id },
        { $set: updateData },
        { returnUpdatedDocs: true },
        (err, numAffected, updatedBooking) => {
          if (err) return reject(err);
          if (numAffected === 0) return reject(new Error('Booking not found'));
          resolve(updatedBooking);
        }
      );
    });
  },

  /**
   * Cancel a booking
   * @param {string} id - The booking ID
   * @returns {Promise<Object>} The cancelled booking
   */
  cancel(id) {
    return this.update(id, { status: 'cancelled' });
  },

  /**
   * Delete a booking
   * @param {string} id - The booking ID
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

module.exports = BookingModel;