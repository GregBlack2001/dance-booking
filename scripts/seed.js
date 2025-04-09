require('dotenv').config();
const path = require('path');
const fs = require('fs');
const UserModel = require('../models/user');
const CourseModel = require('../models/course');
const ClassModel = require('../models/class');

// Ensure database directory exists
const dataPath = process.env.DB_PATH || path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    isAdmin: true
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    isAdmin: false
  }
];

const courses = [
  {
    title: 'Ballet for Beginners',
    description: 'Introduction to classical ballet techniques and positions. Perfect for those with no prior dance experience.',
    level: 'beginner',
    imageUrl: 'https://via.placeholder.com/300x200?text=Ballet'
  },
  {
    title: 'Intermediate Hip Hop',
    description: 'Take your hip hop skills to the next level with more complex routines and techniques.',
    level: 'intermediate',
    imageUrl: 'https://via.placeholder.com/300x200?text=Hip+Hop'
  },
  {
    title: 'Advanced Contemporary',
    description: 'Advanced contemporary dance techniques focusing on expression and fluidity.',
    level: 'advanced',
    imageUrl: 'https://via.placeholder.com/300x200?text=Contemporary'
  },
  {
    title: 'Salsa for Everyone',
    description: 'Learn the basics of salsa dancing in a fun and welcoming environment.',
    level: 'beginner',
    imageUrl: 'https://via.placeholder.com/300x200?text=Salsa'
  }
];

// Function to create classes for a course
const createClassesForCourse = async (courseId, courseTitle, level) => {
  const now = new Date();
  const classes = [];
  
  // Create 3 classes for each course
  for (let i = 1; i <= 3; i++) {
    const classDate = new Date(now);
    classDate.setDate(now.getDate() + i * 2); // Every other day
    
    const classData = {
      courseId,
      title: `${courseTitle} - Class ${i}`,
      description: `Session ${i} of the ${courseTitle} course. ${level === 'beginner' ? 'No prior experience required.' : 'Some prior experience recommended.'}`,
      date: classDate,
      startTime: '18:00',
      endTime: '19:30',
      capacity: 20,
      instructor: level === 'beginner' ? 'Sarah Johnson' : level === 'intermediate' ? 'Michael Chen' : 'Elena Rodriguez',
      location: 'Dance Studio ' + (i + 1)
    };
    
    const newClass = await ClassModel.create(classData);
    classes.push(newClass);
    console.log(`Created class: ${newClass.title}`);
  }
  
  return classes;
};

// Main seed function
const seed = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Create users
    for (const userData of users) {
      const { name, email, password, isAdmin } = userData;
      
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (!existingUser) {
        const user = await UserModel.create({ name, email, password }, isAdmin);
        console.log(`Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`User ${email} already exists, skipping...`);
      }
    }
    
    // Create courses and classes
    for (const courseData of courses) {
      // Check if course already exists
      const existingCourses = await CourseModel.findAll();
      const courseExists = existingCourses.some(c => c.title === courseData.title);
      
      if (!courseExists) {
        const course = await CourseModel.create(courseData);
        console.log(`Created course: ${course.title}`);
        
        // Create classes for this course
        await createClassesForCourse(course._id, course.title, course.level);
      } else {
        console.log(`Course "${courseData.title}" already exists, skipping...`);
      }
    }
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seed();