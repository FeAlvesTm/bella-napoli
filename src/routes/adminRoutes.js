import express from 'express';
import * as adminController from '../controllers/adminController.js';
import multer from 'multer';
import { protect } from '../middlewares/protect.js';
import { restrictTo } from '../middlewares/restrictTo.js';
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'chef'));

router.get('/dashboard', adminController.getDashboardPage);
router.get('/management', adminController.getManagementPage);
router.get('/products', adminController.getProductsPage);
router.get('/customers', adminController.getCustomersPage);
router.get('/analytics', adminController.getAnalyticsPage);
router.get('/storeConfig', adminController.getStoreConfigPage);
router.post(
  '/createNewProduct',
  upload.single('image'),
  adminController.createProduct
);

router.put(
  '/updateProduct/:id',
  upload.single('image'),
  adminController.updateProduct
);

router.put('/updateStoreConfig', adminController.updateStoreConfig);

router.delete('/deleteProduct/:id', adminController.deleteProduct);
export default router;
