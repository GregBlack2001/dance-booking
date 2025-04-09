const UserModel = require('../../../models/user');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Create a temporary database for testing
const TEST_DB_PATH = path.join(os.tmpdir(), 'test-dance-booking');

// Mock the environment variable
process.env.DB_PATH = TEST_DB_PATH;

// Ensure test directory exists
if (!fs.existsSync(TEST_DB_PATH)) {
  fs.mkdirSync(TEST_DB_PATH, { recursive: true });
}

// Test database file path
const testDbFile = path.join(TEST_DB_PATH, 'users.db');

describe('User Model', () => {
  // Clean up before and after tests
  beforeEach(() => {
    if (fs.existsSync(testDbFile)) {
      fs.unlinkSync(testDbFile);
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDbFile)) {
      fs.unlinkSync(testDbFile);
    }
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.rmdirSync(TEST_DB_PATH, { recursive: true });
    }
  });

  // Test user creation
  test('should create a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await UserModel.create(userData);

    expect(user).toBeDefined();
    expect(user._id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.password).toBeUndefined(); // Password should not be returned
    expect(user.role).toBe('user'); // Default role
  });

  // Test creating admin user
  test('should create a new admin user', async () => {
    const userData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpass123'
    };

    const user = await UserModel.create(userData, true);

    expect(user).toBeDefined();
    expect(user.role).toBe('admin');
  });

  // Test finding user by email
  test('should find a user by email', async () => {
    const userData = {
      name: 'Find User',
      email: 'find@example.com',
      password: 'findpass123'
    };

    await UserModel.create(userData);
    
    const foundUser = await UserModel.findByEmail('find@example.com');
    
    expect(foundUser).toBeDefined();
    expect(foundUser.name).toBe(userData.name);
  });

  // Test password verification
  test('should verify correct password', async () => {
    const userData = {
      name: 'Password User',
      email: 'password@example.com',
      password: 'correctpass123'
    };

    await UserModel.create(userData);
    
    const verifiedUser = await UserModel.verifyPassword('password@example.com', 'correctpass123');
    
    expect(verifiedUser).toBeDefined();
    expect(verifiedUser.name).toBe(userData.name);
  });

  // Test wrong password
  test('should reject incorrect password', async () => {
    const userData = {
      name: 'Wrong Password User',
      email: 'wrong@example.com',
      password: 'correctpass123'
    };

    await UserModel.create(userData);
    
    const verifiedUser = await UserModel.verifyPassword('wrong@example.com', 'wrongpass123');
    
    expect(verifiedUser).toBeNull();
  });

  // Test user update
  test('should update a user', async () => {
    const userData = {
      name: 'Update User',
      email: 'update@example.com',
      password: 'updatepass123'
    };

    const user = await UserModel.create(userData);
    
    const updatedUser = await UserModel.update(user._id, { name: 'Updated Name' });
    
    expect(updatedUser).toBeDefined();
    expect(updatedUser.name).toBe('Updated Name');
    expect(updatedUser.email).toBe(userData.email); // Email should not change
  });

  // Test user deletion
  test('should delete a user', async () => {
    const userData = {
      name: 'Delete User',
      email: 'delete@example.com',
      password: 'deletepass123'
    };

    const user = await UserModel.create(userData);
    
    const deleted = await UserModel.delete(user._id);
    
    expect(deleted).toBe(true);
    
    const foundUser = await UserModel.findById(user._id);
    expect(foundUser).toBeNull();
  });

  // Test password hashing
  test('should hash the password', async () => {
    const userData = {
      name: 'Hash User',
      email: 'hash@example.com',
      password: 'hashpass123'
    };

    await UserModel.create(userData);
    
    const user = await UserModel.findByEmail('hash@example.com');
    
    // Password should be hashed
    expect(user.password).not.toBe(userData.password);
    
    // Verify hash is valid
    const isMatch = await bcrypt.compare(userData.password, user.password);
    expect(isMatch).toBe(true);
  });

  // Test email uniqueness
  test('should enforce email uniqueness', async () => {
    const userData = {
      name: 'Unique User',
      email: 'unique@example.com',
      password: 'uniquepass123'
    };

    await UserModel.create(userData);
    
    // Try to create another user with the same email
    await expect(UserModel.create({
      name: 'Another User',
      email: 'unique@example.com', // Same email
      password: 'anotherpass123'
    })).rejects.toThrow();
  });
});