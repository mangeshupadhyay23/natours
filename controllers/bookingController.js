const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/cathcAsync');
const factory = require('./handlerFactory');
const AppError = require('./errorController');


exports.getCheckoutSession = catchAsync((req, res, next) => {
    // STEP 1 => Get Currently booked tour
    const tour = await Tour.findById(req.params.tourId)
    // STEP 2 => Create checkout Session
    stripe.checkout.session.create({
        payment_method:card,
        success_url:`${req.protocol}://${req.get('host')}/`,
        cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`
    })
    // STEP 3 => Create session as response
});
