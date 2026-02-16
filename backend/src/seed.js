require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Board = require('./models/Board');
const List = require('./models/List');
const Task = require('./models/Task');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskcollab');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Board.deleteMany({}),
      List.deleteMany({}),
      Task.deleteMany({})
    ]);

    // Create users
    const demo = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123'
    });

    const alice = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123'
    });

    const bob = await User.create({
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'password123'
    });

    // Create a board
    const board = await Board.create({
      title: 'Project Alpha',
      description: 'Main project board for team collaboration',
      background: '#0079bf',
      owner: demo._id,
      members: [
        { user: demo._id, role: 'admin' },
        { user: alice._id, role: 'member' },
        { user: bob._id, role: 'member' }
      ]
    });

    // Create lists
    const todoList = await List.create({
      title: 'To Do',
      board: board._id,
      position: 0
    });

    const inProgressList = await List.create({
      title: 'In Progress',
      board: board._id,
      position: 1
    });

    const reviewList = await List.create({
      title: 'Review',
      board: board._id,
      position: 2
    });

    const doneList = await List.create({
      title: 'Done',
      board: board._id,
      position: 3
    });

    // Create tasks
    const tasks = [
      { title: 'Set up project structure', description: 'Initialize the repository and set up the basic project structure', list: todoList._id, board: board._id, position: 0, priority: 'high', createdBy: demo._id, assignees: [demo._id] },
      { title: 'Design database schema', description: 'Create the MongoDB schema for all collections', list: todoList._id, board: board._id, position: 1, priority: 'high', createdBy: demo._id, assignees: [alice._id] },
      { title: 'Implement authentication', description: 'JWT-based signup and login', list: todoList._id, board: board._id, position: 2, priority: 'urgent', createdBy: demo._id, assignees: [bob._id] },
      { title: 'Create REST API endpoints', description: 'Build all CRUD endpoints for boards, lists, and tasks', list: inProgressList._id, board: board._id, position: 0, priority: 'high', createdBy: alice._id, assignees: [alice._id, demo._id] },
      { title: 'Set up WebSocket server', description: 'Configure Socket.IO for real-time communication', list: inProgressList._id, board: board._id, position: 1, priority: 'medium', createdBy: bob._id, assignees: [bob._id] },
      { title: 'Build React components', description: 'Create reusable UI components', list: reviewList._id, board: board._id, position: 0, priority: 'medium', createdBy: demo._id, assignees: [demo._id] },
      { title: 'Add drag and drop', description: 'Implement drag and drop for tasks across lists', list: reviewList._id, board: board._id, position: 1, priority: 'medium', createdBy: alice._id, assignees: [alice._id] },
      { title: 'Write README', description: 'Documentation for setup and architecture', list: doneList._id, board: board._id, position: 0, priority: 'low', createdBy: demo._id, assignees: [demo._id], isCompleted: true },
    ];

    await Task.insertMany(tasks);

    // Create second board
    const board2 = await Board.create({
      title: 'Personal Tasks',
      description: 'My personal task tracking',
      background: '#519839',
      owner: demo._id,
      members: [{ user: demo._id, role: 'admin' }]
    });

    const personalTodo = await List.create({
      title: 'Backlog',
      board: board2._id,
      position: 0
    });

    const personalDoing = await List.create({
      title: 'Doing',
      board: board2._id,
      position: 1
    });

    await Task.insertMany([
      { title: 'Read documentation', list: personalTodo._id, board: board2._id, position: 0, priority: 'low', createdBy: demo._id },
      { title: 'Practice coding', list: personalDoing._id, board: board2._id, position: 0, priority: 'medium', createdBy: demo._id },
    ]);

    console.log('✅ Seed data created successfully');
    console.log('\nDemo Credentials:');
    console.log('  demo@example.com / password123');
    console.log('  alice@example.com / password123');
    console.log('  bob@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();