const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { logActivity } = require('../services/activityService');
const { emitToBoard, emitToUser } = require('../services/socketService');
const { PAGINATION } = require('../utils/constants');

exports.getBoards = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ],
      isArchived: false
    };

    if (search) {
      query.$and = [{ $text: { $search: search } }];
    }

    const [boards, total] = await Promise.all([
      Board.find(query)
        .populate('owner', 'name email avatar')
        .populate('members.user', 'name email avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Board.countDocuments(query)
    ]);

    ApiResponse.paginated(res, boards, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

exports.getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
    if (!board) {
      return ApiResponse.error(res, 'Board not found', 404);
    }

    if (!board.isMember(req.userId)) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

     // Populate after the check
    await board.populate('owner', 'name email avatar');
    await board.populate('members.user', 'name email avatar');

    // Get lists with tasks
    const lists = await List.find({ board: board._id, isArchived: false })
      .sort({ position: 1 })
      .lean();

    const tasks = await Task.find({ board: board._id, isArchived: false })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ position: 1 })
      .lean();

    // Group tasks by list
    const tasksByList = {};
    tasks.forEach(task => {
      const listId = task.list.toString();
      if (!tasksByList[listId]) tasksByList[listId] = [];
      tasksByList[listId].push(task);
    });

    const listsWithTasks = lists.map(list => ({
      ...list,
      tasks: tasksByList[list._id.toString()] || []
    }));

    ApiResponse.success(res, {
      board,
      lists: listsWithTasks
    });
  } catch (error) {
    next(error);
  }
};

exports.createBoard = async (req, res, next) => {
  try {
    const { title, description, background } = req.body;

    const board = await Board.create({
      title,
      description,
      background: background || '#0079bf',
      owner: req.userId,
      members: [{ user: req.userId, role: 'admin' }]
    });

    await board.populate('owner', 'name email avatar');
    await board.populate('members.user', 'name email avatar');

    // Log activity
    await logActivity({
      board: board._id,
      user: req.userId,
      action: 'board_created',
      entityType: 'board',
      entityId: board._id,
      entityTitle: board.title
    });

    ApiResponse.created(res, board);
  } catch (error) {
    next(error);
  }
};

exports.updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return ApiResponse.error(res, 'Board not found', 404);
    }

    if (!board.isAdmin(req.userId)) {
      return ApiResponse.error(res, 'Only admins can update the board', 403);
    }

    const { title, description, background } = req.body;
    if (title) board.title = title;
    if (description !== undefined) board.description = description;
    if (background) board.background = background;

    await board.save();
    await board.populate('owner', 'name email avatar');
    await board.populate('members.user', 'name email avatar');

    emitToBoard(board._id, 'board:updated', board);

    await logActivity({
      board: board._id,
      user: req.userId,
      action: 'board_updated',
      entityType: 'board',
      entityId: board._id,
      entityTitle: board.title
    });

    ApiResponse.success(res, board);
  } catch (error) {
    next(error);
  }
};

exports.deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return ApiResponse.error(res, 'Board not found', 404);
    }

    if (board.owner.toString() !== req.userId.toString()) {
      return ApiResponse.error(res, 'Only the owner can delete the board', 403);
    }

    // Delete all associated data
    await Promise.all([
      Task.deleteMany({ board: board._id }),
      List.deleteMany({ board: board._id }),
      Activity.deleteMany({ board: board._id }),
      Board.findByIdAndDelete(board._id)
    ]);

    emitToBoard(board._id, 'board:deleted', { boardId: board._id });

    ApiResponse.success(res, null, 'Board deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return ApiResponse.error(res, 'Board not found', 404);
    }

    if (!board.isAdmin(req.userId)) {
      return ApiResponse.error(res, 'Only admins can add members', 403);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    if (board.isMember(user._id)) {
      return ApiResponse.error(res, 'User is already a member', 409);
    }

    board.members.push({
      user: user._id,
      role: role || 'member'
    });

    await board.save();
    await board.populate('owner', 'name email avatar');
    await board.populate('members.user', 'name email avatar');

    emitToBoard(board._id, 'member:added', {
      board: board._id,
      member: { user, role: role || 'member' }
    });

    emitToUser(user._id, 'board:invited', { board });

    await logActivity({
      board: board._id,
      user: req.userId,
      action: 'member_added',
      entityType: 'member',
      entityId: user._id,
      entityTitle: user.name
    });

    ApiResponse.success(res, board, 'Member added successfully');
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return ApiResponse.error(res, 'Board not found', 404);
    }

    if (!board.isAdmin(req.userId)) {
      return ApiResponse.error(res, 'Only admins can remove members', 403);
    }

    const memberUserId = req.params.userId;
    if (board.owner.toString() === memberUserId) {
      return ApiResponse.error(res, 'Cannot remove the board owner', 400);
    }

    board.members = board.members.filter(
      m => m.user.toString() !== memberUserId
    );

    await board.save();
    await board.populate('owner', 'name email avatar');
    await board.populate('members.user', 'name email avatar');

    emitToBoard(board._id, 'member:removed', {
      board: board._id,
      userId: memberUserId
    });

    await logActivity({
      board: board._id,
      user: req.userId,
      action: 'member_removed',
      entityType: 'member',
      entityId: memberUserId,
      entityTitle: ''
    });

    ApiResponse.success(res, board, 'Member removed successfully');
  } catch (error) {
    next(error);
  }
};