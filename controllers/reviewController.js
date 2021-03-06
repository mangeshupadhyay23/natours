const AppError = require('../utils/appError');
const catchAsync = require('../utils/cathcAsync');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');
const Factory = require('../controllers/handlerFactory');

exports.getAllReviews = Factory.getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};

//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'Success',
//     length: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = Factory.createOne(Review);

exports.deleteReview = Factory.deleteOne(Review);
exports.updateReview = Factory.updateOne(Review);
exports.getReview = Factory.getOne(Review);
