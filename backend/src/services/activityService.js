const Activity = require('../models/Activity');
const { getIO } = require('../config/socket');

const logActivity = async ({ board, user, action, entityType, entityId, entityTitle, details = {} }) => {
  try {
    const activity = await Activity.create({
      board,
      user,
      action,
      entityType,
      entityId,
      entityTitle,
      details
    });

    // Populate user data before broadcasting
    await activity.populate('user', 'name email avatar');

    // Broadcast to board room
    try {
      const io = getIO();
      io.to(`board:${board}`).emit('activity:new', activity);
    } catch (socketError) {
      // Socket might not be initialized during tests
      console.log('Socket not available for activity broadcast');
    }

    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging shouldn't break main flow
  }
};

module.exports = { logActivity };