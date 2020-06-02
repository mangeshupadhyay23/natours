const fs = require('fs');
const Tour = require('../models/tourModel');

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
    const queryObj = { ...req.query };

    console.log(queryObj);

    const tours = await Tour.find();

    // const tours = await Tour.find({ duration: 5, difficulty: 'easy' });

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    res.json({
      status: 'success',
      length: tours.length,
      data: { tours: tours },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
    });
  }
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
