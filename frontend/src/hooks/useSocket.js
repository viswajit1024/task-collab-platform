// frontend/src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket, joinBoard, leaveBoard } from '../socket/socketClient';
import {
  socketBoardUpdated,
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
  const { token } = useSelector(state => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);
    socketRef.current = socket;

    return () => {
      // Don't disconnect globally - just when component unmounts
    };
  }, [token]);

  useEffect(() => {
    if (!boardId || !token) return;

    const socket = getSocket();
    if (!socket) return;

    // Join the board room
    joinBoard(boardId);

    // Set up event listeners
    const handlers = {
      'board:updated': (data) => dispatch(socketBoardUpdated(data)),
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
  }, [boardId, token, dispatch]);

  return socketRef;
};

export const useSocketConnection = () => {
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
    return () => {
      disconnectSocket();
    };
  }, [token]);
};