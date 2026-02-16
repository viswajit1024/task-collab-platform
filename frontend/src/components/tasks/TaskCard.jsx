import React from 'react';
import Avatar from '../common/Avatar';
import { PRIORITY_CONFIG } from '../../utils/constants';
import { formatDate, isDueSoon, isOverdue } from '../../utils/helpers';
import './TaskCard.css';

const TaskCard = ({ task, isDragging, onClick }) => {
  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div
      className={`task-card ${isDragging ? 'task-card-dragging' : ''} ${task.isCompleted ? 'task-card-completed' : ''}`}
      onClick={onClick}
    >
      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="task-labels">
          {task.labels.map((label, i) => (
            <span
              key={i}
              className="task-label"
              style={{ background: label.color }}
            >
              {label.text}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="task-card-title">{task.title}</h4>

      {/* Meta info */}
      <div className="task-card-meta">
        <div className="task-card-badges">
          {/* Priority */}
          <span
            className="task-badge"
            style={{ background: priority?.bg, color: priority?.color }}
          >
            {priority?.label}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <span className={`task-badge ${isOverdue(task.dueDate) ? 'task-badge-overdue' : isDueSoon(task.dueDate) ? 'task-badge-due-soon' : ''}`}>
              🕐 {formatDate(task.dueDate)}
            </span>
          )}

          {/* Description indicator */}
          {task.description && (
            <span className="task-badge">📝</span>
          )}
        </div>

        {/* Assignees */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="task-card-assignees">
            {task.assignees.slice(0, 3).map(assignee => (
              <Avatar
                key={assignee._id}
                name={assignee.name}
                src={assignee.avatar}
                size={24}
              />
            ))}
            {task.assignees.length > 3 && (
              <span className="task-assignee-more">+{task.assignees.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;