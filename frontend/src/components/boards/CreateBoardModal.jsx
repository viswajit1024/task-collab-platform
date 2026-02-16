import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBoard } from '../../store/slices/boardSlice';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import { BOARD_COLORS } from '../../utils/constants';

const CreateBoardModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState(BOARD_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await dispatch(createBoard({ title, description, background }));
      if (result.type === 'boards/createBoard/fulfilled') {
        toast.success('Board created!');
        setTitle('');
        setDescription('');
        setBackground(BOARD_COLORS[0]);
        onClose();
      } else {
        toast.error('Failed to create board');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Board" size="small">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              background,
              borderRadius: 8,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 16
            }}
          >
            {title || 'Board Preview'}
          </div>

          <label className="label">Board Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Enter board title"
            required
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea"
            placeholder="Optional description"
            rows={2}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label">Background Color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BOARD_COLORS.map(color => (
              <div
                key={color}
                onClick={() => setBackground(color)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: color,
                  cursor: 'pointer',
                  border: background === color ? '3px solid var(--gray-900)' : '3px solid transparent',
                  transition: 'border var(--transition)'
                }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!title.trim() || isSubmitting}
          style={{ width: '100%', padding: '10px' }}
        >
          {isSubmitting ? 'Creating...' : 'Create Board'}
        </button>
      </form>
    </Modal>
  );
};

export default CreateBoardModal;