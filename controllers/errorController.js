const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = err;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value},Please Use Another Value`;
  return new AppError(message, 400);
};

const handleJwtExpireError = (err) =>
  new AppError('Session Expired Please Login again', 401);

const handleWebTokenError = (err) => {
  return new AppError('Invalid token, Please Login again', 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    name: err.name,
    message: err.message,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong !',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.log(err.name);
    console.log(err.code);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'JsonWebTokenError') error = handleWebTokenError(err);
    if (err.name === 'TokenExpireError') erroor = handleJwtExpireError(err);
    sendErrorProd(error, res);
  }
};
