import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoards, fetchBoard, createBoard, deleteBoard } from '../store/slices/boardSlice';

export const useBoard = () => {
  const dispatch = useDispatch();
  const boardState = useSelector(state => state.boards);

  const memoizedFetchBoards = useCallback((params) => dispatch(fetchBoards(params)), [dispatch]);
  const memoizedFetchBoard = useCallback((id) => dispatch(fetchBoard(id)), [dispatch]);
  const memoizedCreateBoard = useCallback((data) => dispatch(createBoard(data)), [dispatch]);
  const memoizedDeleteBoard = useCallback((id) => dispatch(deleteBoard(id)), [dispatch]);

  return {
    ...boardState,
    fetchBoards: memoizedFetchBoards,
    fetchBoard: memoizedFetchBoard,
    createBoard: memoizedCreateBoard,
    deleteBoard: memoizedDeleteBoard,
  };
};