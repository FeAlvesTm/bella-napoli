export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return next(new AppError('Faça login para acessar esta página', 401));
      }

      if (!allowedRoles.includes(user.role)) {
        return next(new AppError('Você não tem permissão', 403));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
