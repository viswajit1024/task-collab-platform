import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createTask } from '../../store/slices/taskSlice';
import toast from 'react-hot-toast';
import './CreateTaskForm.css';

const CreateTaskForm = ({ listId, onClose }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const result = await dispatch(createTask({ title, listId }));
    if (result.type === 'tasks/createTask/fulfilled') {
      setTitle('');
      inputRef.current?.focus();
    } else {
      toast.error('Failed to create task');
    }
  };

  return (
    <div className="create-task-form">
      <form onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter a title for this card..."
          className="create-task-input"
          rows={2}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
            if (e.key === 'Escape') onClose();
          }}
        />
        <div className="create-task-actions">
          <button type="submit" className="btn btn-primary btn-sm">Add Card</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskForm;