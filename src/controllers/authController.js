import Users from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'node:fs/promises';
import cloudinary from './cloudinary.js';
import AppError from '../middlewares/appError.js';

export const signup = async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    zip_code,
    neighborhood,
    street,
    number,
    complement,
  } = req.body;

  try {
    // 1. Verificar se o usuário já existe
    const existingUser = await Users.findUserByEmail(email); // Certifique-se que esse método existe no seu Model
    if (existingUser) {
      return res.status(400).render('userViews/signup', {
        errorMessage: 'Este e-mail já está em uso.',
        oldData: req.body, // Para manter os campos preenchidos no formulário
      });
    }

    let avatarUrl =
      'https://res.cloudinary.com/djgps6pjd/image/upload/v1771541972/icone-sem-usuario_onvrtj.png';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'pizzaria bella napoli/users',
        public_id: `user_${Date.now()}`,
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        ],
      });
      avatarUrl = result.secure_url;
      await fs.unlink(req.file.path).catch(() => {});
    }

    const newUser = await Users.createUser(
      name,
      email,
      password,
      phone,
      zip_code,
      neighborhood,
      street,
      number,
      complement,
      avatarUrl
    );

    const jwtToken = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
    });

    res.cookie('jwt', jwtToken, {
      expires: new Date(
        Date.now() +
          Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    });

    if (req.headers['content-type'] === 'application/json') {
      return res.status(201).json({ status: 'success', user: newUser });
    }

    res.redirect('/menu/pizzas');
  } catch (error) {
    console.error('Erro no signup:', error);
    // Caso ocorra erro de banco de dados por email único (fallback)
    if (error.code === '23505') {
      // Código comum do Postgres para Unique Violation
      return res.status(400).render('userViews/signup', {
        errorMessage: 'Este e-mail já está em uso.',
        oldData: req.body,
      });
    }
    next(error);
  }
};

// Ajuste na renderização inicial para evitar erros de variáveis undefined
export const getSignupPage = (req, res) => {
  res.render('userViews/signup', { errorMessage: null, oldData: {} });
};

export const getLoginPage = async (req, res, next) => {
  try {
    res.render('userViews/login', { paginaAtual: 'login' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findUserByEmail(email);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.render('userViews/login', {
        paginaAtual: 'login',
        errorMessage: 'E-mail ou senha incorretos!',
      });
    }

    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
    });

    const cookieOptions = {
      expires: new Date(
        Date.now() +
          Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    res.cookie('jwt', jwtToken, cookieOptions);
    res.redirect('/menu/pizzas');
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.redirect('/menu/pizzas');
};
