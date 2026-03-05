import express from 'express';
import * as authController from '../controllers/authController.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/signup', authController.getSignupPage);
router.post('/signup', upload.single('avatar'), authController.signup);
router.post('/login', authController.login);
router.get('/login', authController.getLoginPage);
router.get('/logout', authController.logout);

export default router;
