import jwt from 'jsonwebtoken';
import Users from '../models/userModel.js';

export const isLoggedIn = async (req, res, next) => {
  try {
    if (!req.cookies.jwt) {
      res.locals.user = null;
      return next();
    }

    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

    const user = await Users.findUserById(decoded.userId);

    if (!user) {
      res.locals.user = null;
      return next();
    }

    res.locals.user = user;
    next();
  } catch (error) {
    res.locals.user = null;
    return next();
  }
};
