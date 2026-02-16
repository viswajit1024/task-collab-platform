import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoard, clearCurrentBoard } from '../store/slices/boardSlice';
import { useSocket } from '../hooks/useSocket';
import BoardView from '../components/boards/BoardView';
import Loader from '../components/common/Loader';
import './BoardPage.css';

const BoardPage = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBoard, isLoading, error } = useSelector(state => state.boards);

  // Set up socket connection for this board
  useSocket(boardId);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
    }

    return () => {
      dispatch(clearCurrentBoard());
    };
  }, [boardId, dispatch]);

  useEffect(() => {
    if (error === 'Access denied' || error === 'Board not found') {
      navigate('/dashboard');
    }
  }, [error, navigate]);

  if (isLoading && !currentBoard) {
    return <Loader fullScreen />;
  }

  if (!currentBoard) {
    return (
      <div className="board-not-found">
        <h2>Board not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return <BoardView />;
};

export default BoardPage;