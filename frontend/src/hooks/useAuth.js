import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, signup, logout, clearError } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  const memoizedLogin = useCallback((data) => dispatch(login(data)), [dispatch]);
  const memoizedSignup = useCallback((data) => dispatch(signup(data)), [dispatch]);
  const memoizedLogout = useCallback(() => dispatch(logout()), [dispatch]);
  const memoizedClearError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    ...auth,
    login: memoizedLogin,
    signup: memoizedSignup,
    logout: memoizedLogout,
    clearError: memoizedClearError,
  };
};