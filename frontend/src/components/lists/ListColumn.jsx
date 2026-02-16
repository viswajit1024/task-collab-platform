// frontend/src/components/lists/ListColumn.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Draggable } from '@hello-pangea/dnd';
import TaskCard from '../tasks/TaskCard';
import CreateTaskForm from '../tasks/CreateTaskForm';
import { updateList } from '../../store/slices/listSlice';
import { deleteList } from '../../store/slices/listSlice';
import { updateListInStore, socketListDeleted } from '../../store/slices/boardSlice';
import toast from 'react-hot-toast';
import './ListColumn.css';

const ListColumn = ({ list, isDraggingOver, onTaskClick }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { currentBoard } = useSelector(state => state.boards);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const handleTitleSubmit = async () => {
    if (title.trim() && title !== list.title) {
      const result = await dispatch(updateList({ id: list._id, data: { title } }));
      if (result.type === 'lists/updateList/fulfilled') {
        dispatch(updateListInStore({ listId: list._id, updates: { title } }));
      }
    } else {
      setTitle(list.title);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${list.title}" and all its tasks?`)) {
      const result = await dispatch(deleteList(list._id));
      if (result.type === 'lists/deleteList/fulfilled') {
        dispatch(socketListDeleted({ listId: list._id }));
        toast.success('List deleted');
      }
    }
    setShowMenu(false);
  };

  const isAdmin = currentBoard?.owner?._id === user?._id ||
    currentBoard?.members?.find(m => m.user?._id === user?._id)?.role === 'admin';

  const tasks = list.tasks || [];

  return (
    <div className={`list-column ${isDraggingOver ? 'list-dragging-over' : ''}`}>
      <div className="list-header">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setTitle(list.title);
                setIsEditing(false);
              }
            }}
            className="list-title-input"
            autoFocus
          />
        ) : (
          <h3
            className="list-title"
            onClick={() => setIsEditing(true)}
          >
            {list.title}
            <span className="list-count">{tasks.length}</span>
          </h3>
        )}
        <div className="list-menu-wrapper">
          <button className="list-menu-btn" onClick={() => setShowMenu(!showMenu)}>
            ⋯
          </button>
          {showMenu && (
            <>
              <div className="list-menu-backdrop" onClick={() => setShowMenu(false)} />
              <div className="list-menu">
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                  ✏️ Rename
                </button>
                {isAdmin && (
                  <button onClick={handleDelete} className="list-menu-danger">
                    🗑️ Delete list
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="list-tasks">
        {tasks
          .sort((a, b) => a.position - b.position)
          .map((task, index) => (
            <Draggable key={task._id} draggableId={task._id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <TaskCard
                    task={task}
                    isDragging={snapshot.isDragging}
                    onClick={() => onTaskClick(task)}
                  />
                </div>
              )}
            </Draggable>
          ))}
      </div>

      {showCreateTask ? (
        <CreateTaskForm
          listId={list._id}
          onClose={() => setShowCreateTask(false)}
        />
      ) : (
        <button
          className="list-add-task-btn"
          onClick={() => setShowCreateTask(true)}
        >
          + Add a card
        </button>
      )}
    </div>
  );
};

export default ListColumn;