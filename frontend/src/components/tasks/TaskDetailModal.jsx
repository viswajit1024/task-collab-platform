import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, deleteTask, assignTask } from '../../store/slices/taskSlice';
import { closeTaskModal } from '../../store/slices/uiSlice';
import Avatar from '../common/Avatar';
import { PRIORITY_CONFIG } from '../../utils/constants';
import { timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './TaskDetailModal.css';

const TaskDetailModal = ({ task: initialTask, onClose, board }) => {
  const dispatch = useDispatch();
  const { lists } = useSelector(state => state.boards);

  // Find the latest version of the task from lists
  let currentTask = initialTask;
  for (const list of lists) {
    const found = (list.tasks || []).find(t => t._id === initialTask._id);
    if (found) {
      currentTask = found;
      break;
    }
  }

  const [title, setTitle] = useState(currentTask.title);
  const [description, setDescription] = useState(currentTask.description || '');
  const [priority, setPriority] = useState(currentTask.priority);
  const [dueDate, setDueDate] = useState(
    currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : ''
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  useEffect(() => {
    setTitle(currentTask.title);
    setDescription(currentTask.description || '');
    setPriority(currentTask.priority);
    setDueDate(currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : '');
  }, [currentTask]);

  const handleUpdateField = async (field, value) => {
    const result = await dispatch(updateTask({
      id: currentTask._id,
      data: { [field]: value }
    }));
    if (result.type !== 'tasks/updateTask/fulfilled') {
      toast.error('Failed to update task');
    }
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== currentTask.title) {
      handleUpdateField('title', title);
    } else {
      setTitle(currentTask.title);
    }
    setIsEditingTitle(false);
  };

  const handleDescBlur = () => {
    if (description !== (currentTask.description || '')) {
      handleUpdateField('description', description);
    }
    setIsEditingDesc(false);
  };

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
    handleUpdateField('priority', newPriority);
  };

  const handleDueDateChange = (e) => {
    const newDate = e.target.value;
    setDueDate(newDate);
    handleUpdateField('dueDate', newDate || null);
  };

  const handleToggleComplete = () => {
    handleUpdateField('isCompleted', !currentTask.isCompleted);
  };

  const handleAssign = async (userId) => {
    const isAssigned = currentTask.assignees?.some(a => a._id === userId);
    const result = await dispatch(assignTask({
      id: currentTask._id,
      userId,
      action: isAssigned ? 'unassign' : 'assign'
    }));
    if (result.type === 'tasks/assignTask/fulfilled') {
      toast.success(isAssigned ? 'User unassigned' : 'User assigned');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      const result = await dispatch(deleteTask({ id: currentTask._id }));
      if (result.type === 'tasks/deleteTask/fulfilled') {
        toast.success('Task deleted');
        dispatch(closeTaskModal());
      }
    }
  };

  const currentList = lists.find(l =>
    (l.tasks || []).some(t => t._id === currentTask._id)
  );

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <div className="task-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="task-detail-close" onClick={onClose}>✕</button>

        <div className="task-detail-content">
          {/* Main content */}
          <div className="task-detail-main">
            {/* Title */}
            <div className="task-detail-section">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleTitleBlur();
                    if (e.key === 'Escape') {
                      setTitle(currentTask.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="task-detail-title-input"
                  autoFocus
                />
              ) : (
                <h2
                  className="task-detail-title"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {currentTask.isCompleted && <span className="task-complete-badge">✓</span>}
                  {currentTask.title}
                </h2>
              )}
              {currentList && (
                <p className="task-detail-list-info">
                  in list <strong>{currentList.title}</strong>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="task-detail-section">
              <h4 className="task-detail-section-title">📝 Description</h4>
              {isEditingDesc ? (
                <div>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="textarea"
                    rows={4}
                    placeholder="Add a more detailed description..."
                    autoFocus
                  />
                  <div className="flex gap-sm mt-sm">
                    <button className="btn btn-primary btn-sm" onClick={handleDescBlur}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => {
                      setDescription(currentTask.description || '');
                      setIsEditingDesc(false);
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  className="task-detail-description"
                  onClick={() => setIsEditingDesc(true)}
                >
                  {currentTask.description || 'Click to add a description...'}
                </div>
              )}
            </div>

            {/* Labels */}
            {currentTask.labels && currentTask.labels.length > 0 && (
              <div className="task-detail-section">
                <h4 className="task-detail-section-title">🏷️ Labels</h4>
                <div className="task-detail-labels">
                  {currentTask.labels.map((label, i) => (
                    <span
                      key={i}
                      className="task-label"
                      style={{ background: label.color }}
                    >
                      {label.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="task-detail-sidebar">
            {/* Priority */}
            <div className="task-detail-sidebar-section">
              <h4 className="task-detail-sidebar-title">Priority</h4>
              <div className="priority-options">
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    className={`priority-option ${priority === key ? 'priority-active' : ''}`}
                    style={{
                      borderColor: priority === key ? config.color : 'transparent',
                      background: priority === key ? config.bg : 'var(--gray-100)'
                    }}
                    onClick={() => handlePriorityChange(key)}
                  >
                    <span className="priority-dot" style={{ background: config.color }} />
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="task-detail-sidebar-section">
              <h4 className="task-detail-sidebar-title">Due Date</h4>
              <input
                type="date"
                value={dueDate}
                onChange={handleDueDateChange}
                className="input"
              />
            </div>

            {/* Members */}
            <div className="task-detail-sidebar-section">
              <h4 className="task-detail-sidebar-title">Members</h4>
              <div className="member-list">
                {board.members?.map(member => {
                  const isAssigned = currentTask.assignees?.some(
                    a => a._id === member.user?._id
                  );
                  return (
                    <div
                      key={member.user?._id}
                      className={`member-item ${isAssigned ? 'member-assigned' : ''}`}
                      onClick={() => handleAssign(member.user?._id)}
                    >
                      <Avatar name={member.user?.name} size={28} />
                      <span className="member-name">{member.user?.name}</span>
                      {isAssigned && <span className="member-check">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="task-detail-sidebar-section">
              <h4 className="task-detail-sidebar-title">Actions</h4>
              <button
                className={`btn ${currentTask.isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleToggleComplete}
                style={{ width: '100%', marginBottom: 8 }}
              >
                {currentTask.isCompleted ? '↩️ Mark Incomplete' : '✅ Mark Complete'}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                style={{ width: '100%' }}
              >
                🗑️ Delete Task
              </button>
            </div>

            {/* Timestamps */}
            <div className="task-detail-sidebar-section">
              <p className="text-sm text-muted">
                Created {timeAgo(currentTask.createdAt)}
              </p>
              {currentTask.updatedAt !== currentTask.createdAt && (
                <p className="text-sm text-muted">
                  Updated {timeAgo(currentTask.updatedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;