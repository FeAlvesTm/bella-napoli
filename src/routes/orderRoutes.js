import express from 'express';
import { protect } from '../middlewares/protect.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

router.post('/checkout-session', protect, orderController.getCheckoutSession);

export default router;
