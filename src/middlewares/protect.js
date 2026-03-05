import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import Users from '../models/userModel.js';

export const protect = async (req, res, next) => {
  try {
    const jwtToken = req.cookies.jwt;

    if (!jwtToken) {
      throw new AppError('Faça login para acessar esta página', 401);
    }

    const decoded = await promisify(jwt.verify)(
      jwtToken,
      process.env.JWT_SECRET
    );

    const currentUser = await Users.findUserById(decoded.userId);

    if (!currentUser) {
      throw new AppError('Usuário não existe mais', 401);
    }
    req.user = currentUser;
    next();
  } catch (error) {
    next(error); // 👈 manda pro errorHandler
  }
};
