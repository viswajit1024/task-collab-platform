import { useSelector, useDispatch } from 'react-redux';
import { fetchBoards, fetchBoard, createBoard, deleteBoard } from '../store/slices/boardSlice';

export const useBoard = () => {
  const dispatch = useDispatch();
  const boardState = useSelector(state => state.boards);

  return {
    ...boardState,
    fetchBoards: (params) => dispatch(fetchBoards(params)),
    fetchBoard: (id) => dispatch(fetchBoard(id)),
    createBoard: (data) => dispatch(createBoard(data)),
    deleteBoard: (id) => dispatch(deleteBoard(id)),
  };
};