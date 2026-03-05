import { AdminModel } from '../models/adminModel.js';
import Users from '../models/userModel.js';
import Products from '../models/productsModel.js';
import cloudinary from '../controllers/cloudinary.js';
import AppError from '../middlewares/appError.js';
import fs from 'fs/promises';
import { AdminDashboardService } from '../services/adminDashboard.js';

async function uploadImage(file, category) {
  if (!file) return null;
  const result = await cloudinary.uploader.upload(file.path, {
    folder: `pizzaria bella napoli/products/${category}`,
  });
  await fs.unlink(file.path).catch(() => {});
  return result.secure_url;
}

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Products.getProductById(id);

    if (!product) {
      throw new AppError('Produto não encontrado', 404);
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, status } = req.body;

    const currentProduct = await Products.getProductById(id);
    if (!currentProduct) {
      throw new AppError('Produto não encontrado', 404);
    }

    let image_url = currentProduct.image_url;

    if (req.file) {
      image_url = await uploadImage(req.file, category);

      await fs.unlink(req.file.path).catch(() => {});
    }

    const updatedProduct = await Products.updateProduct(id, {
      name,
      price,
      description,
      image_url,
      category,
      status,
    });

    return res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, category, status } = req.body;
    let image_url = '';

    if (req.file) {
      image_url = await uploadImage(req.file, category);
    }

    const newProduct = await Products.createProduct({
      name,
      price,
      description,
      image_url,
      category,
      status,
    });

    return res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await Products.deleteProduct(id);

    if (result === 0) {
      throw new AppError('Produto não encontrado', 404);
    }

    return res
      .status(200)
      .json({ success: true, message: 'Produto removido com sucesso!' });
  } catch (error) {
    next(error);
  }
};

export const getDashboardPage = async (req, res, next) => {
  try {
    const dashboardData = await AdminDashboardService.getDashboardData();
    res.render('adminPanel/dashboard', { dashboardData, page: 'dashboard' });
  } catch (error) {
    next(error);
  }
};

export const getManagementPage = async (req, res, next) => {
  try {
    const managementData = await AdminDashboardService.getDashboardData();

    res.render('adminPanel/management', { managementData, page: 'management' });
  } catch (error) {
    next(error);
  }
};

export const getProductsPage = async (req, res, next) => {
  try {
    const products = await Products.getAllProducts();
    res.render('adminPanel/products', { page: 'products', products });
  } catch (error) {
    next(error);
  }
};

export const getCustomersPage = async (req, res, next) => {
  try {
    const data = await AdminDashboardService.getCustomersData();
    res.render('adminPanel/customers', {
      customers: data.customers,
      stats: {
        totalCustomers: data.stats.totalCustomers,
        baseGrowth: data.baseGrowth,
        totalOrders: data.stats.totalOrders,
        avgLtv: data.stats.avgLtv.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      },
      page: 'customers',
      layout: 'adminBase',
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsPage = async (req, res, next) => {
  try {
    const analyticsData = await AdminDashboardService.getDashboardData();
    res.render('adminPanel/analytics', { analyticsData, page: 'analytics' });
  } catch (error) {
    next(error);
  }
};

export const getStoreConfigPage = async (req, res, next) => {
  try {
    const storeConfig = await AdminModel.getStoreConfig();
    res.render('adminPanel/storeConfig', { page: 'storeConfig', storeConfig });
  } catch (error) {
    next(error);
  }
};

export const updateStoreConfig = async (req, res, next) => {
  try {
    const data = req.body;

    const updatedConfig = await AdminModel.updateStoreConfig(data);

    return res.status(200).json({
      success: true,
      message: 'Configurações salvas com sucesso!',
      config: updatedConfig,
    });
  } catch (error) {
    next(error);
  }
};
