// frontend/src/hooks/useSocket.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSocket, joinBoard, leaveBoard } from '../socket/socketClient';
import {
  socketBoardUpdated,
  socketBoardDeleted,
  socketListCreated,
  socketListUpdated,
  socketListDeleted,
  socketListsReordered,
  socketTaskCreated,
  socketTaskUpdated,
  socketTaskDeleted,
  socketTaskMoved,
  socketMemberAdded,
} from '../store/slices/boardSlice';
import { addOnlineUser, removeOnlineUser } from '../store/slices/uiSlice';

export const useSocket = (boardId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();
    if (!socket) return;

    // Join the board room
    joinBoard(boardId);

    // Set up event listeners
    const handlers = {
      'board:updated': (data) => dispatch(socketBoardUpdated(data)),
      'board:deleted': (data) => dispatch(socketBoardDeleted(data)),
      'list:created': (data) => dispatch(socketListCreated(data)),
      'list:updated': (data) => dispatch(socketListUpdated(data)),
      'list:deleted': (data) => dispatch(socketListDeleted(data)),
      'lists:reordered': (data) => dispatch(socketListsReordered(data)),
      'task:created': (data) => dispatch(socketTaskCreated(data)),
      'task:updated': (data) => dispatch(socketTaskUpdated(data)),
      'task:deleted': (data) => dispatch(socketTaskDeleted(data)),
      'task:moved': (data) => dispatch(socketTaskMoved(data)),
      'member:added': (data) => dispatch(socketMemberAdded(data)),
      'user:joined': (data) => dispatch(addOnlineUser(data)),
      'user:left': (data) => dispatch(removeOnlineUser(data)),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      leaveBoard(boardId);
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [boardId, dispatch]);
};