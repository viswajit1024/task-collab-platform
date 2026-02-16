import { useSelector, useDispatch } from 'react-redux';
import { login, signup, logout, clearError } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  return {
    ...auth,
    login: (data) => dispatch(login(data)),
    signup: (data) => dispatch(signup(data)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
};