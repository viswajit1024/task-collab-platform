const { getIO } = require('../config/socket');

const emitToBoard = (boardId, event, data) => {
  try {
    const io = getIO();
    io.to(`board:${boardId}`).emit(event, data);
  } catch (error) {
    console.log('Socket emit failed:', error.message);
  }
};

const emitToUser = (userId, event, data) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit(event, data);
  } catch (error) {
    console.log('Socket emit failed:', error.message);
  }
};

module.exports = { emitToBoard, emitToUser };