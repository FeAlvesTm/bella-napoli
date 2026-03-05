import { Orders } from '../models/ordersModel.js';
import { AdminModel } from '../models/adminModel.js';
import Users from '../models/userModel.js';
import cloudinary from './cloudinary.js';
import AppError from '../middlewares/appError.js';
import fs from 'fs';

export const getAboutPage = (req, res, next) => {
  try {
    res.render('userViews/about', { paginaAtual: 'about' });
  } catch (error) {
    next(error);
  }
};

export const getUserPage = async (req, res, next) => {
  try {
    const user = req.user;
    const configData = await AdminModel.getStoreConfig();

    const dashboard = await Orders.getUserDashboard(user.id);
    const memberSince = new Date(user.created_at)
      .toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
      .replace(/^\w/, (c) => c.toUpperCase());

    res.render('userViews/userPage', { ...dashboard, memberSince, configData });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userData = req.body;
    if (!userData.name || !userData.email) {
      throw new AppError('Nome e email são obrigatórios', 400);
    }
    const userId = req.user.id;
    let imageUrl = req.user.user_img_url;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'pizzaria bella napoli/users',
      });

      imageUrl = result.secure_url;
      await fs.promises.unlink(req.file.path).catch(() => {});
    }

    await Users.updateUserData(userId, userData, imageUrl);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getMyOrdersApi = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orders = await Orders.getOrdersByUser(userId);

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
