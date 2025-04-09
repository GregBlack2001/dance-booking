const Datastore = require('nedb');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Create the users collection
const db = new Datastore({
  filename: path.join(process.env.DB_PATH || './data', 'users.db'),
  autoload: true
});

// Create indexes
db.ensureIndex({ fieldName: 'email', unique: true });

const UserModel = {
  /**
   * Create a new user
   * @param {Object} userData - User data including name, email, password
   * @param {boolean} isAdmin - Whether the user is an admin or not
   * @returns {Promise<Object>} The created user
   */
  async create(userData, isAdmin = false) {
    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Prepare user object
      const user = {
        _id: uuidv4(),
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert into database and return the created user
      return new Promise((resolve, reject) => {
        db.insert(user, (err, newUser) => {
          if (err) return reject(err);
          
          // Don't return the password
          const { password, ...userWithoutPassword } = newUser;
          resolve(userWithoutPassword);
        });
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find a user by email
   * @param {string} email - The email to search for
   * @returns {Promise<Object|null>} The found user or null
   */
  findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  },

  /**
   * Find a user by ID
   * @param {string} id - The user ID
   * @returns {Promise<Object|null>} The found user or null
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      db.findOne({ _id: id }, (err, user) => {
        if (err) return reject(err);
        
        if (user) {
          // Don't return the password
          const { password, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } else {
          resolve(null);
        }
      });
    });
  },

  /**
   * Get all users
   * @returns {Promise<Array>} Array of users
   */
  findAll() {
    return new Promise((resolve, reject) => {
      db.find({}, (err, users) => {
        if (err) return reject(err);
        
        // Remove passwords from all users
        const safeUsers = users.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        
        resolve(safeUsers);
      });
    });
  },

  /**
   * Update a user
   * @param {string} id - The user ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} The updated user
   */
  async update(id, userData) {
    try {
      // Get current user
      const currentUser = await this.findById(id);
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Prepare update object
      const updateData = {
        ...userData,
        updatedAt: new Date()
      };

      // If password is being updated, hash it
      if (userData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(userData.password, saltRounds);
      }

      // Update the user
      return new Promise((resolve, reject) => {
        db.update(
          { _id: id },
          { $set: updateData },
          { returnUpdatedDocs: true },
          (err, numAffected, updatedUser) => {
            if (err) return reject(err);
            if (numAffected === 0) return reject(new Error('User not found'));
            
            // Don't return the password
            const { password, ...userWithoutPassword } = updatedUser;
            resolve(userWithoutPassword);
          }
        );
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a user
   * @param {string} id - The user ID
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
   * Verify a user's password
   * @param {string} email - User's email
   * @param {string} password - Password to verify
   * @returns {Promise<Object|null>} User if verified, null otherwise
   */
  async verifyPassword(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) return null;

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return null;

      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = UserModel;