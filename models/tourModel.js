const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [48, 'Tour Name must have less or equal than 40 char'],
      minlength: [10, 'Tour Name must have more or equal than 10 char'],
      validate: [validator.isAlpha, 'Tour name must only contain letters'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A Tour Must Have A Duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour Must Have A Group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount Price Should be less than actual price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image '],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  }

  //   {
  //     toJSON: { virtuals: true },
  //     toObject: { virtuals: true },
  //   }
);
// tourSchema.virtual('durationInWeeks').get(function () {
//   return this.duration / 7;
// });

//document middleware : run before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will Save Doc');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  //   console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
