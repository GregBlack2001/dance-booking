const request = require('supertest');
const app = require('../../index');
const path = require('path');
const fs = require('fs');
const os = require('os');
const jwt = require('jsonwebtoken');
const UserModel = require('../../models/user');
const CourseModel = require('../../models/course');
const ClassModel = require('../../models/class');
const BookingModel = require('../../models/booking');

// Create a temporary database for testing
const TEST_DB_PATH = path.join(os.tmpdir(), 'test-dance-booking-integration');

// Mock the environment variables
process.env.DB_PATH = TEST_DB_PATH;
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

// Ensure test directory exists
if (!fs.existsSync(TEST_DB_PATH)) {
  fs.mkdirSync(TEST_DB_PATH, { recursive: true });
}

// Test database file paths
const testUserDbFile = path.join(TEST_DB_PATH, 'users.db');
const testCourseDbFile = path.join(TEST_DB_PATH, 'courses.db');
const testClassDbFile = path.join(TEST_DB_PATH, 'classes.db');
const testBookingDbFile = path.join(TEST_DB_PATH, 'bookings.db');

// Test data
let testUser;
let testCourse;
let testClass;
let authCookie;

describe('Booking Flow Integration Test', () => {
  // Setup test data before all tests
  beforeAll(async () => {
    // Clean up any existing test files
    if (fs.existsSync(testUserDbFile)) fs.unlinkSync(testUserDbFile);
    if (fs.existsSync(testCourseDbFile)) fs.unlinkSync(testCourseDbFile);
    if (fs.existsSync(testClassDbFile)) fs.unlinkSync(testClassDbFile);
    if (fs.existsSync(testBookingDbFile)) fs.unlinkSync(testBookingDbFile);

    // Create test user
    testUser = await UserModel.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Create test course
    testCourse = await CourseModel.create({
      title: 'Test Dance Course',
      description: 'A course for testing',
      level: 'beginner'
    });

    // Create test class
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    testClass = await ClassModel.create({
      courseId: testCourse._id,
      title: 'Test Dance Class',
      description: 'A class for testing',
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:30',
      capacity: 10,
      instructor: 'Test Instructor',
      location: 'Test Studio'
    });

    // Generate JWT token for authentication
    const token = jwt.sign(
      { userId: testUser._id, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    authCookie = `jwt=${token}`;
  });

  // Clean up after all tests
  afterAll(async () => {
    // Remove test database files
    if (fs.existsSync(testUserDbFile)) fs.unlinkSync(testUserDbFile);
    if (fs.existsSync(testCourseDbFile)) fs.unlinkSync(testCourseDbFile);
    if (fs.existsSync(testClassDbFile)) fs.unlinkSync(testClassDbFile);
    if (fs.existsSync(testBookingDbFile)) fs.unlinkSync(testBookingDbFile);
    
    // Remove test directory
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.rmdirSync(TEST_DB_PATH, { recursive: true });
    }
  });

  // Test viewing courses
  test('should display courses list', async () => {
    const response = await request(app)
      .get('/courses')
      .expect(200);
    
    expect(response.text).toContain(testCourse.title);
  });

  // Test viewing course details with classes
  test('should display course details with classes', async () => {
    const response = await request(app)
      .get(`/courses/${testCourse._id}`)
      .expect(200);
    
    expect(response.text).toContain(testCourse.title);
    expect(response.text).toContain(testClass.title);
  });

  // Test viewing class details
  test('should display class details', async () => {
    const response = await request(app)
      .get(`/courses/class/${testClass._id}`)
      .expect(200);
    
    expect(response.text).toContain(testClass.title);
    expect(response.text).toContain(testCourse.title);
    
    // Unauthenticated user should see login to book button
    expect(response.text).toContain('Login to Book');
  });

  // Test class details with authentication
  test('should display booking button for authenticated user', async () => {
    const response = await request(app)
      .get(`/courses/class/${testClass._id}`)
      .set('Cookie', [authCookie])
      .expect(200);
    
    expect(response.text).toContain('Book This Class');
  });

  // Test booking creation
  test('should create a booking for an authenticated user', async () => {
    const response = await request(app)
      .post('/bookings')
      .set('Cookie', [authCookie])
      .send({ classId: testClass._id })
      .expect(302); // Redirect to dashboard
    
    // Verify booking was created in database
    const bookings = await BookingModel.findByUser(testUser._id);
    expect(bookings.length).toBe(1);
    expect(bookings[0].classId).toBe(testClass._id);
    expect(bookings[0].status).toBe('confirmed');
  });

  // Test dashboard shows bookings
  test('should display bookings on user dashboard', async () => {
    const response = await request(app)
      .get('/dashboard')
      .set('Cookie', [authCookie])
      .expect(200);
    
    expect(response.text).toContain(testClass.title);
    expect(response.text).toContain('confirmed');
  });

  // Test duplicate booking prevention
  test('should prevent duplicate bookings', async () => {
    // Try to book the same class again
    const response = await request(app)
      .post('/bookings')
      .set('Cookie', [authCookie])
      .send({ classId: testClass._id })
      .expect(400);
    
    // Check response contains error message
    expect(response.body.message).toContain('already booked');
  });

  // Test booking cancellation
  test('should cancel a booking', async () => {
    // Get the booking ID
    const bookings = await BookingModel.findByUser(testUser._id);
    const bookingId = bookings[0]._id;
    
    const response = await request(app)
      .get(`/bookings/cancel/${bookingId}`)
      .set('Cookie', [authCookie])
      .expect(302); // Redirect to dashboard
    
    // Verify booking was cancelled
    const updatedBooking = await BookingModel.findById(bookingId);
    expect(updatedBooking.status).toBe('cancelled');
  });

  // Test authentication required for booking
  test('should redirect to login when trying to book without authentication', async () => {
    const response = await request(app)
      .post('/bookings')
      .send({ classId: testClass._id })
      .expect(401);
  });
});