const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'List title is required'],
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  position: {
    type: Number,
    required: true,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
listSchema.index({ board: 1, position: 1 });
listSchema.index({ board: 1, isArchived: 1 });

// Virtual for tasks
listSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'list',
  options: { sort: { position: 1 } }
});

module.exports = mongoose.model('List', listSchema);