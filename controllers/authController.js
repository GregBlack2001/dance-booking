const UserModel = require('../models/user');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// JWT token generation
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

const AuthController = {
  /**
   * Display login form
   */
  showLogin: (req, res) => {
    // If user is already logged in, redirect to dashboard
    if (res.locals.user) {
      return res.redirect('/dashboard');
    }
    
    const redirectUrl = req.query.redirect || '';
    res.render('auth/login', { title: 'Login', redirectUrl });
  },

  /**
   * Handle login form submission
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const redirectUrl = req.body.redirect || '/dashboard';
      
      // Validate input
      if (!email || !password) {
        return res.render('auth/login', {
          title: 'Login',
          error: 'Email and password are required',
          email
        });
      }

      // Validate email format
      if (!validator.isEmail(email)) {
        return res.render('auth/login', {
          title: 'Login',
          error: 'Please enter a valid email address',
          email
        });
      }

      // Verify credentials
      const user = await UserModel.verifyPassword(email, password);
      
      if (!user) {
        return res.render('auth/login', {
          title: 'Login',
          error: 'Invalid email or password',
          email
        });
      }

      // Generate JWT token
      const token = generateToken(user._id, user.role);
      
      // Set JWT cookie
      res.cookie('jwt', token, cookieOptions);
      
      // Redirect to requested page or dashboard
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Display registration form
   */
  showRegister: (req, res) => {
    // If user is already logged in, redirect to dashboard
    if (res.locals.user) {
      return res.redirect('/dashboard');
    }
    
    res.render('auth/register', { title: 'Register' });
  },

  /**
   * Handle registration form submission
   */
  register: async (req, res, next) => {
    try {
      const { name, email, password, confirmPassword } = req.body;
      
      // Validate input
      const errors = {};
      
      if (!name || name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
      
      if (!email || !validator.isEmail(email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!password || password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      // Check if there are validation errors
      if (Object.keys(errors).length > 0) {
        return res.render('auth/register', {
          title: 'Register',
          errors,
          name,
          email
        });
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.render('auth/register', {
          title: 'Register',
          errors: { email: 'Email already in use' },
          name,
          email
        });
      }

      // Create new user
      const user = await UserModel.create({ name, email, password });
      
      // Generate JWT token
      const token = generateToken(user._id, user.role);
      
      // Set JWT cookie
      res.cookie('jwt', token, cookieOptions);
      
      // Redirect to dashboard
      res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle logout
   */
  logout: (req, res) => {
    // Clear JWT cookie
    res.clearCookie('jwt');
    
    // Redirect to home page
    res.redirect('/');
  }
};

module.exports = AuthController;