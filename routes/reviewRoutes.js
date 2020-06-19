const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

// POST /:tourID/reviews
// POST /reviews
// both these routes will end up here

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictedTo('user'),
    reviewController.createReview
  );
router.route('/:id').delete(reviewController.deleteReview);

module.exports = router;
