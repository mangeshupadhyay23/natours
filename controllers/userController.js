const AppError = require('../utils/appError');
const catchAsync = require('../utils/cathcAsync');
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const cathcAsync = require('../utils/cathcAsync');
const factory = require('../controllers/handlerFactory');
const multer = require('multer');

const upload = multer({ dest: 'public/img/users' });

exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// THis will put a fake id in Params
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res) => {
//   const users = await User.find();

//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Not yet defined',
  });
};
exports.updateMe = async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  // Step 1=> Create Error if user posts password data cause we have another route for that purpose
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for upating password', 400));
  }

  // Step 2=> Filtered Out field names not allowed to be updated
  const filterBody = filterObj(req.body, 'name', 'email');

  // Step 3 => Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    dat: {
      message: 'Updated Credetials',
      user: updatedUser,
    },
  });
};

exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // DO not update password with it
exports.deleteUser = factory.deleteOne(User); // only permited to admin

exports.deleteMe = cathcAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
