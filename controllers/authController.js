const User = require('../models/userModel');
const catchAsync = require('../utils/cathcAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(200).json({
    status: 'sucess',
    data: {
      newUser,
    },
  });
});
