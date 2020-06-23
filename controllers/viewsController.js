const Tour = require('../models/tourModel');
const catchAsync = require('../utils/cathcAsync');

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

exports.getTour = catchAsync(async (req, res) => {
  // STEP 1 => GET THE TOUR DATA
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  console.log(tour.reviews);
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
