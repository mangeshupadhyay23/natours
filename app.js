const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRoutes');
const app = express();

/// 1)GLOBAL  Middlewares
//SECURITY HTTP HEADERS
app.use(helmet());

// Development Logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please Try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against xxs
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//Serving Static file
app.use(express.static(`${__dirname}/public`));

// Testing middleware
app.use((req, res, next) => {
  console.log('Hello form middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

/// 2) ROUTE HANDLERS

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
// app.get('/api/v1/tour/:id', getTour);

///3) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  // const err = new Error();
  // err.status = 'fail';
  // err.statusCode = 404;
  // err.message = `cant find ${req.originalUrl}`;

  next(new AppError(`Cant find ${req.originalUrl} on this server !!`, 404));
});
app.use(globalErrorHandler);

// app.all('*', (req, res, next) => {
//   res.send(404).json({
//     status: 'Failed',
//     message: `Cant find ${req.originalUrl}`,
//   });
// });

module.exports = app;
// app.route('/api/v1/tours').get(getAllTours).post(createTour);

// app.use((req, res, next) => {
//   console.log('Hello form middleware');
//   next();
// }); we cant use it beofore the routes that are executed before it cause they have already sent a response and hence response request cyucle is already finished

// app
//   .route('/api/v1/tours/:id')
//   .get(getTour)
//   .delete(deleteTour)
//   .patch(updateTour);

// app.route('/api/v1/users').get(getAllUsers).post(createUser);

/// 4) SERVER STARTED
