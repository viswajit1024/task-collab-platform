const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return ApiResponse.success(res, []);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.userId }
    })
    .select('name email avatar')
    .limit(10);

    ApiResponse.success(res, users);
  } catch (error) {
    next(error);
  }
};