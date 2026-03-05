import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middlewares/protect.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/perfil', protect, userController.getUserPage);
router.get('/about', userController.getAboutPage);
router.get('/my-orders-api', protect, userController.getMyOrdersApi);
router.post(
  '/update-profile',
  protect,
  upload.single('avatar'),
  userController.updateUserProfile
);

export default router;
