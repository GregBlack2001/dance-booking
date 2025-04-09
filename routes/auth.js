const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Login
router.get('/login', AuthController.showLogin);
router.post('/login', AuthController.login);

// Registration
router.get('/register', AuthController.showRegister);
router.post('/register', AuthController.register);

// Logout
router.get('/logout', AuthController.logout);

module.exports = router;