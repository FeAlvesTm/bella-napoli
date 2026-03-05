import express from 'express';
import menuRoutes from './routes/menuRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/errorHandler.js';
import { isLoggedIn } from './middlewares/isLoggedIn.js';
import { getStoreConfig } from './middlewares/getStoreConfig.js';
import * as orderController from './controllers/orderController.js';
import cors from 'cors';

import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  orderController.webhookCheckout
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(isLoggedIn);
app.use(getStoreConfig);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*', // Temporário para testes; depois troque por sua URL real
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

app.use('/menu', menuRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/adminPanel', adminRoutes);
app.use('/order', orderRoutes);
app.use(errorHandler);

export default app;
