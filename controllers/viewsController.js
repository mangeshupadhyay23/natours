const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/cathcAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  // STEP 1 => Get Tour Data From Collection
  const tours = await Tour.find();
  // STEP 2 => Build Template

  // STEP 3 => Render That Template using tour data from 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // STEP 1 => GET THE TOUR DATA
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  // STEP 2 => build templtes(not here)

  // STEP 3 => RENDER DATA
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  // STEP 1 => getting login functionalities from API
  // STEP 2 => build template(not here )
  // STEP 3 => RENDER DATA
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'My account',
    user: req.user,
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'My account',
    user: updatedUser,
  });
});