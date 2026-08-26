const express = require('express');
const { AuthController } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');
const { registerSchema, loginSchema, refreshTokenSchema, updateProfileSchema } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), AuthController.updateProfile);
router.put('/password', authenticate, AuthController.changePassword);
router.get('/sessions', authenticate, AuthController.getSessions);
router.post('/sessions/logout-others', authenticate, AuthController.logoutOtherSessions);

module.exports = router;
