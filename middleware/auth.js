const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

const auth = {
  /**
   * Middleware to authenticate JWT token
   */
  authenticate: (req, res, next) => {
    // Get token from cookies
    const token = req.cookies.jwt;

    // Check if token exists
    if (!token) {
      return res.status(401).render('auth/login', {
        error: 'Please log in to access this page',
        redirectUrl: req.originalUrl
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user to request object
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      
      next();
    } catch (error) {
      res.clearCookie('jwt');
      return res.status(401).render('auth/login', {
        error: 'Session expired. Please log in again',
        redirectUrl: req.originalUrl
      });
    }
  },

  /**
   * Middleware to check if user is admin
   */
  isAdmin: (req, res, next) => {
    if (req.userRole !== 'admin') {
      return res.status(403).render('403', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page'
      });
    }
    next();
  },

  /**
   * Middleware to attach user to response locals if logged in
   */
  attachUser: async (req, res, next) => {
    // Get token from cookies
    const token = req.cookies.jwt;

    // If no token, continue without attaching user
    if (!token) {
      res.locals.user = null;
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await UserModel.findById(decoded.userId);
      
      // Attach user to response locals
      res.locals.user = user;
      res.locals.isAdmin = user && user.role === 'admin';
      
      next();
    } catch (error) {
      // If token is invalid, clear it and continue
      res.clearCookie('jwt');
      res.locals.user = null;
      next();
    }
  }
};

module.exports = auth;