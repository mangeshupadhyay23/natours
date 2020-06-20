const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

// POST /:tourID/reviews
// POST /reviews
// both these routes will end up here

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictedTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );
router
  .route('/:id')
  .patch(reviewController.updateReview)
  .delete(
    authController.restrictedTo('user', 'admin'),
    reviewController.deleteReview
  )
  .get(
    authController.restrictedTo('user', 'admin'),
    reviewController.getReview
  );

module.exports = router;
