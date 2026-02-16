const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'board_created', 'board_updated',
      'list_created', 'list_updated', 'list_deleted', 'list_reordered',
      'task_created', 'task_updated', 'task_deleted', 'task_moved',
      'task_assigned', 'task_unassigned', 'task_completed',
      'member_added', 'member_removed'
    ]
  },
  entityType: {
    type: String,
    enum: ['board', 'list', 'task', 'member'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityTitle: {
    type: String,
    default: ''
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
activitySchema.index({ board: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // TTL: 90 days

module.exports = mongoose.model('Activity', activitySchema);