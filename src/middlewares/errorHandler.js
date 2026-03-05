export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'Erro interno do servidor',
  });
}
