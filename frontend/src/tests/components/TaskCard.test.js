import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from '../../components/tasks/TaskCard';

const mockTask = {
  _id: '1',
  title: 'Test Task',
  description: 'Test description',
  priority: 'high',
  labels: [{ text: 'Bug', color: '#eb5a46' }],
  assignees: [{ _id: 'u1', name: 'John Doe' }],
  dueDate: new Date('2025-12-31').toISOString(),
  isCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('TaskCard', () => {
  test('renders task title', () => {
    render(<TaskCard task={mockTask} isDragging={false} onClick={() => {}} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('displays labels', () => {
    render(<TaskCard task={mockTask} isDragging={false} onClick={() => {}} />);
    expect(screen.getByText('Bug')).toBeInTheDocument();
  });

  test('shows priority badge', () => {
    render(<TaskCard task={mockTask} isDragging={false} onClick={() => {}} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  test('applies completed style', () => {
    const completedTask = { ...mockTask, isCompleted: true };
    const { container } = render(
      <TaskCard task={completedTask} isDragging={false} onClick={() => {}} />
    );
    expect(container.firstChild).toHaveClass('task-card-completed');
  });
});