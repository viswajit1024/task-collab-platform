// frontend/src/components/boards/BoardView.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import ListColumn from '../lists/ListColumn';
import CreateListForm from '../lists/CreateListForm';
import TaskDetailModal from '../tasks/TaskDetailModal';
import ActivityFeed from '../activity/ActivityFeed';
import Avatar from '../common/Avatar';
import SearchBar from '../common/SearchBar';
import { useDragDrop } from '../../hooks/useDragDrop';
import { addMember, removeMember, deleteBoard } from '../../store/slices/boardSlice';
import { openTaskModal, closeTaskModal, toggleSidebar } from '../../store/slices/uiSlice';
import toast from 'react-hot-toast';
import './BoardView.css';

const BoardView = () => {
  const dispatch = useDispatch();
  const { currentBoard, lists } = useSelector(state => state.boards);
  const { isTaskModalOpen, selectedTask, isSidebarOpen } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  const { handleDragEnd } = useDragDrop();
  const navigate = useNavigate();

  const [memberEmail, setMemberEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentBoard) return null;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    const result = await dispatch(addMember({
      boardId: currentBoard._id,
      email: memberEmail
    }));

    if (result.type === 'boards/addMember/fulfilled') {
      toast.success('Member added!');
      setMemberEmail('');
      setShowAddMember(false);
    } else {
      toast.error(result.payload || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Remove this member?')) {
      const result = await dispatch(removeMember({
        boardId: currentBoard._id,
        userId
      }));
      if (result.type === 'boards/removeMember/fulfilled') {
        toast.success('Member removed');
      }
    }
  };

  const handleDeleteBoard = async () => {
    if (!window.confirm('Delete this board and all its data?')) return;
    const result = await dispatch(deleteBoard(currentBoard._id));
    if (result.type === 'boards/deleteBoard/fulfilled') {
      toast.success('Board deleted');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Failed to delete board');
    }
  };

  const filteredLists = lists.map(list => ({
    ...list,
    tasks: (list.tasks || []).filter(task =>
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }));

  return (
    <div className="board-view" style={{ background: currentBoard.background }}>
      {/* Board Header */}
      <div className="board-header">
        <div className="board-header-left">
          <h1 className="board-title">{currentBoard.title}</h1>
          <div className="board-members">
            {currentBoard.members?.map(member => (
              <div key={member.user?._id} className="board-member" title={member.user?.name}>
                <Avatar
                  name={member.user?.name}
                  src={member.user?.avatar}
                  size={28}
                />
                {currentBoard.owner?._id === user?._id && member.user?._id !== user?._id && (
                  <button
                    className="member-remove-btn"
                    onClick={() => handleRemoveMember(member.user._id)}
                    title="Remove member"
                  >✕</button>
                )}
              </div>
            ))}
            <button
              className="btn-add-member"
              onClick={() => setShowAddMember(!showAddMember)}
            >
              <span className="mobile-only">+</span>
              <span className="desktop-only">+ Add Member</span>
            </button>
          </div>
          {showAddMember && (
            <form className="add-member-form" onSubmit={handleAddMember}>
              <input
                type="email"
                value={memberEmail}
                onChange={e => setMemberEmail(e.target.value)}
                placeholder="Enter email address"
                className="input"
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm">Add</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddMember(false)}>Cancel</button>
            </form>
          )}
        </div>
        <div className="board-header-right">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search tasks..."
          />
          <button
            className="btn btn-ghost board-activity-btn"
            onClick={() => dispatch(toggleSidebar())}
          >
            📋 Activity
          </button>
          {currentBoard.owner?._id === user?._id && (
            <button
              className="btn btn-danger"
              onClick={handleDeleteBoard}
              title="Delete board"
            >
              🗑️ Delete Board
            </button>
          )}
        </div>
      </div>

      {/* Lists Area */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-lists-container">
          <div className="board-lists">
            {filteredLists
              .sort((a, b) => a.position - b.position)
              .map(list => (
                <Droppable key={list._id} droppableId={list._id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <ListColumn
                        list={list}
                        isDraggingOver={snapshot.isDraggingOver}
                        onTaskClick={(task) => dispatch(openTaskModal(task))}
                      />
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            <CreateListForm boardId={currentBoard._id} />
          </div>
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      {isTaskModalOpen && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => dispatch(closeTaskModal())}
          board={currentBoard}
        />
      )}

      {/* Activity Sidebar */}
      {isSidebarOpen && (
        <ActivityFeed
          boardId={currentBoard._id}
          onClose={() => dispatch(toggleSidebar())}
        />
      )}
    </div>
  );
};

export default BoardView;