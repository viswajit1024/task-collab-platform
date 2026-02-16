import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import LoginForm from '../../components/auth/LoginForm';

const createTestStore = () => configureStore({
  reducer: {
    auth: authReducer,
  }
});

const renderWithProviders = (component) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginForm', () => {
  test('renders login form', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  test('fills demo credentials on button click', () => {
    renderWithProviders(<LoginForm />);
    fireEvent.click(screen.getByText('Use Demo Account'));
    expect(screen.getByPlaceholderText('Enter your email')).toHaveValue('demo@example.com');
    expect(screen.getByPlaceholderText('Enter your password')).toHaveValue('password123');
  });

  test('updates input values on change', () => {
    renderWithProviders(<LoginForm />);
    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    expect(emailInput).toHaveValue('test@test.com');
  });
});