import React from 'react';
import BoardCard from './BoardCard';
import './BoardList.css';

const BoardList = ({ boards, onCreateClick }) => {
  return (
    <div className="board-grid">
      {boards.map(board => (
        <BoardCard key={board._id} board={board} />
      ))}
      <div className="board-card-new" onClick={onCreateClick}>
        <span className="board-card-new-icon">+</span>
        <span>Create new board</span>
      </div>
    </div>
  );
};

export default BoardList;