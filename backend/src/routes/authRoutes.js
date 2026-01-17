const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate, userSchemas } = require('../middlewares/validation');

// Public routes
router.post(
  '/register',
  validate(userSchemas.register),
  authController.register
);

router.post(
  '/login',
  validate(userSchemas.login),
  authController.login
);

router.post(
  '/refresh-token',
  authController.refreshToken
);

router.post(
  '/verify-email',
  authController.verifyEmail
);

// Protected routes
router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.get(
  '/me',
  authenticate,
  authController.getMe
);

router.patch(
  '/me',
  authenticate,
  validate(userSchemas.update),
  authController.updateProfile
);

router.post(
  '/change-password',
  authenticate,
  validate(userSchemas.changePassword),
  authController.changePassword
);

module.exports = router;
