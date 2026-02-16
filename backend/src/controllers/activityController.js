const Activity = require('../models/Activity');
const Board = require('../models/Board');
const ApiResponse = require('../utils/apiResponse');
const { PAGINATION } = require('../utils/constants');

exports.getActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;
    const { boardId } = req.query;

    if (!boardId) {
      return ApiResponse.error(res, 'Board ID is required', 400);
    }

    const board = await Board.findById(boardId);
    if (!board || !board.isMember(req.userId)) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    const [activities, total] = await Promise.all([
      Activity.find({ board: boardId })
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments({ board: boardId })
    ]);

    ApiResponse.paginated(res, activities, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};