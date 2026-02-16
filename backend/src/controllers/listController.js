const List = require('../models/List');
const Task = require('../models/Task');
const Board = require('../models/Board');
const ApiResponse = require('../utils/apiResponse');
const { logActivity } = require('../services/activityService');
const { emitToBoard } = require('../services/socketService');

exports.createList = async (req, res, next) => {
  try {
    const { title, boardId } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return ApiResponse.error(res, 'Board not found', 404);
    }

    if (!board.isMember(req.userId)) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    // Get max position
    const maxPositionList = await List.findOne({ board: boardId })
      .sort({ position: -1 })
      .select('position');

    const position = maxPositionList ? maxPositionList.position + 1 : 0;

    const list = await List.create({
      title,
      board: boardId,
      position
    });

    const listObj = list.toObject();
    listObj.tasks = [];

    emitToBoard(boardId, 'list:created', listObj);

    await logActivity({
      board: boardId,
      user: req.userId,
      action: 'list_created',
      entityType: 'list',
      entityId: list._id,
      entityTitle: list.title
    });

    ApiResponse.created(res, listObj);
  } catch (error) {
    next(error);
  }
};

exports.updateList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return ApiResponse.error(res, 'List not found', 404);
    }

    const board = await Board.findById(list.board);
    if (!board.isMember(req.userId)) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    const { title } = req.body;
    if (title) list.title = title;

    await list.save();

    emitToBoard(list.board, 'list:updated', list);

    await logActivity({
      board: list.board,
      user: req.userId,
      action: 'list_updated',
      entityType: 'list',
      entityId: list._id,
      entityTitle: list.title
    });

    ApiResponse.success(res, list);
  } catch (error) {
    next(error);
  }
};

exports.deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return ApiResponse.error(res, 'List not found', 404);
    }

    const board = await Board.findById(list.board);
    if (!board.isAdmin(req.userId)) {
      return ApiResponse.error(res, 'Only admins can delete lists', 403);
    }

    const boardId = list.board;
    const listTitle = list.title;

    // Delete all tasks in the list
    await Task.deleteMany({ list: list._id });
    await List.findByIdAndDelete(list._id);

    emitToBoard(boardId, 'list:deleted', { listId: list._id, boardId });

    await logActivity({
      board: boardId,
      user: req.userId,
      action: 'list_deleted',
      entityType: 'list',
      entityId: list._id,
      entityTitle: listTitle
    });

    ApiResponse.success(res, null, 'List deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.reorderLists = async (req, res, next) => {
  try {
    const { boardId, listOrder } = req.body;
    // listOrder: [{ listId, position }]

    const board = await Board.findById(boardId);
    if (!board || !board.isMember(req.userId)) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    const bulkOps = listOrder.map(item => ({
      updateOne: {
        filter: { _id: item.listId, board: boardId },
        update: { $set: { position: item.position } }
      }
    }));

    await List.bulkWrite(bulkOps);

    emitToBoard(boardId, 'lists:reordered', { boardId, listOrder });

    ApiResponse.success(res, null, 'Lists reordered');
  } catch (error) {
    next(error);
  }
};