const cathcAsync = require('../utils/cathcAsync');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) =>
  cathcAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No Document found with that ID', 404));
    }

    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });
