const Task = require('../models/Task');
const List = require('../models/List');
const Board = require('../models/Board');
const ApiResponse = require('../utils/apiResponse');
const { logActivity } = require('../services/activityService');
const { emitToBoard } = require('../services/socketService');
const { PAGINATION } = require('../utils/constants');

exports.getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;
    const { boardId, search, priority, assignee } = req.query;

    const query = { isArchived: false };

    if (boardId) {
      const board = await Board.findById(boardId);
      if (!board || !board.isMember(req.userId)) {
        return ApiResponse.error(res, 'Access denied', 403);
      }
      query.board = boardId;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignee) {
      query.assignees = assignee;
    }

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignees', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .sort({ position: 1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query)
    ]);

    ApiResponse.paginated(res, tasks, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, listId, priority, dueDate, labels } = req.body;

    const list = await List.findById(listId);
    if (!list) {
      return ApiResponse.error(res, 'List not found', 404);
    }

    const board = await Board.findById(list.board);
    if (!board.isMember(req.userId)) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    // Get max position in the list
    const maxPositionTask = await Task.findOne({ list: listId })
      .sort({ position: -1 })
      .select('position');

    const position = maxPositionTask ? maxPositionTask.position + 1 : 0;

    const task = await Task.create({
      title,
      description: description || '',
      list: listId,
      board: list.board,
      position,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      labels: labels || [],
      createdBy: req.userId
    });

    await task.populate('assignees', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    emitToBoard(list.board, 'task:created', task);

    await logActivity({
      board: list.board,
      user: req.userId,
      action: 'task_created',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title
    });

    ApiResponse.created(res, task);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return ApiResponse.error(res, 'Task not found', 404);
    }

    const board = await Board.findById(task.board);
    if (!board.isMember(req.userId)) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    const allowedFields = ['title', 'description', 'priority', 'dueDate', 'labels', 'isCompleted'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    await task.populate('assignees', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    emitToBoard(task.board, 'task:updated', task);

    const action = req.body.isCompleted !== undefined ? 'task_completed' : 'task_updated';
    await logActivity({
      board: task.board,
      user: req.userId,
      action,
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
      details: req.body
    });

    ApiResponse.success(res, task);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return ApiResponse.error(res, 'Task not found', 404);
    }

    const board = await Board.findById(task.board);
    if (!board.isMember(req.userId)) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    const boardId = task.board;
    const listId = task.list;
    const taskTitle = task.title;

    await Task.findByIdAndDelete(task._id);

    emitToBoard(boardId, 'task:deleted', {
      taskId: task._id,
      listId,
      boardId
    });

    await logActivity({
      board: boardId,
      user: req.userId,
      action: 'task_deleted',
      entityType: 'task',
      entityId: task._id,
      entityTitle: taskTitle
    });

    ApiResponse.success(res, null, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.moveTask = async (req, res, next) => {
  try {
    const { sourceListId, destinationListId, newPosition, taskOrder } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return ApiResponse.error(res, 'Task not found', 404);
    }

    const board = await Board.findById(task.board);
    if (!board.isMember(req.userId)) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    // Verify destination list belongs to same board
    const destList = await List.findById(destinationListId);
    if (!destList || destList.board.toString() !== task.board.toString()) {
      return ApiResponse.error(res, 'Invalid destination list', 400);
    }

    const oldListId = task.list;
    task.list = destinationListId;
    task.position = newPosition;
    await task.save();

    // Update positions for tasks in affected lists
    if (taskOrder && taskOrder.length > 0) {
      const bulkOps = taskOrder.map(item => ({
        updateOne: {
          filter: { _id: item.taskId },
          update: { $set: { position: item.position, list: item.listId } }
        }
      }));
      await Task.bulkWrite(bulkOps);
    }

    await task.populate('assignees', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    emitToBoard(task.board, 'task:moved', {
      task,
      sourceListId: oldListId,
      destinationListId,
      taskOrder
    });

    await logActivity({
      board: task.board,
      user: req.userId,
      action: 'task_moved',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
      details: {
        from: sourceListId,
        to: destinationListId
      }
    });

    ApiResponse.success(res, task);
  } catch (error) {
    next(error);
  }
};

exports.assignTask = async (req, res, next) => {
  try {
    const { userId, action } = req.body; // action: 'assign' or 'unassign'

    const task = await Task.findById(req.params.id);
    if (!task) {
      return ApiResponse.error(res, 'Task not found', 404);
    }

    const board = await Board.findById(task.board);
    if (!board.isMember(req.userId)) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    if (!board.isMember(userId)) {
      return ApiResponse.error(res, 'User is not a board member', 400);
    }

    if (action === 'assign') {
      if (!task.assignees.includes(userId)) {
        task.assignees.push(userId);
      }
    } else if (action === 'unassign') {
      task.assignees = task.assignees.filter(
        id => id.toString() !== userId
      );
    }

    await task.save();
    await task.populate('assignees', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    emitToBoard(task.board, 'task:updated', task);

    await logActivity({
      board: task.board,
      user: req.userId,
      action: action === 'assign' ? 'task_assigned' : 'task_unassigned',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
      details: { targetUser: userId }
    });

    ApiResponse.success(res, task);
  } catch (error) {
    next(error);
  }
};