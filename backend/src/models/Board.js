const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Board title is required'],
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  background: {
    type: String,
    default: '#0079bf'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
boardSchema.index({ owner: 1, createdAt: -1 });
boardSchema.index({ 'members.user': 1 });
boardSchema.index({ title: 'text', description: 'text' });

// Virtual for lists
boardSchema.virtual('lists', {
  ref: 'List',
  localField: '_id',
  foreignField: 'board',
  options: { sort: { position: 1 } }
});

// Method to check if user is member
boardSchema.methods.isMember = function(userId) {
  const userIdStr = userId.toString();
  if (this.owner.toString() === userIdStr) return true;
  return this.members.some(m => m.user.toString() === userIdStr);
};

// Method to check if user is admin
boardSchema.methods.isAdmin = function(userId) {
  const userIdStr = userId.toString();
  if (this.owner.toString() === userIdStr) return true;
  const member = this.members.find(m => m.user.toString() === userIdStr);
  return member && member.role === 'admin';
};

module.exports = mongoose.model('Board', boardSchema);