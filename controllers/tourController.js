const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour ID is:${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };
// exports.checkBody = (req, res, next) => {
//   console.log(`this is body ${req.body}`);
//   if (
//     !req.body.name ||
//     req.body.name === '' ||
//     !req.body.price ||
//     req.body.price === 0
//   ) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Incorrect Info',
//     });
//   }
//   next();
// };

exports.getAllTours = async (req, res) => {
  try {
    // console.log(JSON.parse(queryStr));
    // console.log(req.query);

    // const tours = await Tour.find({ duration: 5, difficulty: 'easy' });

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    // console.log(req.query, queryObj);

    // //1. Filtering
    // const queryObj = { ...req.query };

    // // removing not necessary queries for tour search
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // excludedFields.forEach((el) => delete queryObj[el]);

    // // 2. Advance filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);

    // let query = Tour.find(JSON.parse(queryStr));

    //3. Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   //console.log(sortBy);
    //   //query.sort('price ratingsAverage')
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('createdAt');
    // }
    //4. Limiting
    // if (req.query.fields) {
    //   const limits = req.query.fields.split(',').join(' ');
    //   // console.log(limits);
    //   query = query.select(limits);
    // } else {
    //   query = query.select('-__v');
    // }

    //5. Pagination
    // console.log(req.query);
    // const page = req.query.page * 1 || 1; // by default value will be one JS method o defining default values
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // //?page=3&limit=2 10 results has to be skipped and after those 10 ,10 should be shown ...... thats 1-10 on first page 11-20 on second .... if we want to go to third page then skip(20).limit(10)
    // // if (req.query.page.page && req.query.limit) {
    // //   query = query.skip(4).limit(2);
    // // }

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('Page Does Not Exist');
    // }

    //EXECUTING query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    res.json({
      status: 'success',
      length: tours.length,
      data: { tours: tours },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.aliasTopTours = async (req, res, next) => {
  (req.query.limit = '5'),
    (req.query.sort = 'price,-ratingsAverage'),
    (req.query.fields = 'price,difficulty,name,summary,ratingsAverage');
  next();
};

exports.getTour = async (req, res) => {
  // console.log(req.params);

  // const id = req.params.id * 1;
  // const tour = tours.find((el) => {
  //   return el.id === id;
  // });

  try {
    const tour = await Tour.findById(req.params.id);
    // const tour = await Tour.find({ _id: req.params.id });

    res.json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
    });
  }

  // res.json({
  //   status: 'Success',
  //   data: {
  //     tour,
  //   },
  // });
};
exports.createTour = async (req, res) => {
  try {
    //// here we pass the data to a variable newTour and then we save it
    // const newTour= new Tour({
    //   name:'The Forest Hiker',
    //   price:297,
    //   rating:4.7
    // })
    // newTour.save()

    //// whereas here we directly save the data without passing it as a var

    const newTour = await Tour.create(req.body);
    console.log(newTour);

    res.json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    // const tour = await Tour.updateOne(
    //   { _id: req.params.id },
    //   { $set: req.body },
    //   {
    //     new: true,
    //   }
    // );
    res.json({
      status: 'success',
      data: {
        // tour: tour,
        tour,
      },
    });
  } catch {
    res.status(404).json({
      status: 'FAILED',
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'FAILED',
    });
  }
};
