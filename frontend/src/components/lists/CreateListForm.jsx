import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createList } from '../../store/slices/listSlice';
import { socketListCreated } from '../../store/slices/boardSlice';
import toast from 'react-hot-toast';
import './CreateListForm.css';

const CreateListForm = ({ boardId }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const result = await dispatch(createList({ title, boardId }));
    if (result.type === 'lists/createList/fulfilled') {
      // The socket event will add it to the board store
      setTitle('');
      // Keep form open for creating multiple lists
    } else {
      toast.error('Failed to create list');
    }
  };

  if (!isOpen) {
    return (
      <button className="create-list-btn" onClick={() => setIsOpen(true)}>
        + Add another list
      </button>
    );
  }

  return (
    <div className="create-list-form">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter list title..."
          className="input"
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              setTitle('');
            }
          }}
        />
        <div className="create-list-actions">
          <button type="submit" className="btn btn-primary btn-sm">
            Add List
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setIsOpen(false);
              setTitle('');
            }}
          >
            ✕
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListForm;