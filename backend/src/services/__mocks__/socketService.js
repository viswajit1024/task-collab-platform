// src/services/__mocks__/socketService.js
module.exports = {
  // Mock any methods used by activityService
  emitActivity: jest.fn(),
  initSocket: jest.fn(),
  emitToBoard: jest.fn(),
  emitToUser: jest.fn(),
};
