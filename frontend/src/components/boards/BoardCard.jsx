import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BoardCard.css';

const BoardCard = ({ board }) => {
  const navigate = useNavigate();

  return (
    <div
      className="board-card"
      style={{ background: board.background }}
      onClick={() => navigate(`/board/${board._id}`)}
    >
      <div className="board-card-content">
        <h3 className="board-card-title">{board.title}</h3>
        {board.description && (
          <p className="board-card-desc">{board.description}</p>
        )}
      </div>
      <div className="board-card-footer">
        <div className="board-card-members">
          {board.members?.slice(0, 3).map((member) => (
            <div key={member.user?._id || member._id} className="board-card-member-dot" title={member.user?.name} />
          ))}
          {board.members?.length > 3 && (
            <span className="board-card-member-more">+{board.members.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardCard;