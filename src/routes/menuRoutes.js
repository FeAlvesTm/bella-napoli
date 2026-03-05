import express from 'express';
import * as menuController from '../controllers/menuController.js';

const router = express.Router();

router.get('/', menuController.getHome);

router.get('/:category', menuController.getProducts);

export default router;
