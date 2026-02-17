import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import { connectSocket, disconnectSocket } from './socket/socketClient';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Loader from './components/common/Loader';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';

function App() {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, token } = useSelector(state => state.auth);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  // Global socket connection - managed in ONE place only
  useEffect(() => {
    if (token) {
      connectSocket(token);
    }

    return () => {
      disconnectSocket();
    };
  }, [token]);

  if (isLoading && localStorage.getItem('token')) {
    return <Loader fullScreen />;
  }

  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage />
        } />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
        } />
        <Route path="/signup" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/board/:boardId" element={
          <ProtectedRoute><BoardPage /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;