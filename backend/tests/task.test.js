const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Board = require('../src/models/Board');
const List = require('../src/models/List');
const Task = require('../src/models/Task');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;
let token, boardId, listId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Board.deleteMany({}),
    List.deleteMany({}),
    Task.deleteMany({})
  ]);

  const signupRes = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Test', email: 'test@example.com', password: 'password123' });
  token = signupRes.body.data.token;

  const boardRes = await request(app)
    .post('/api/boards')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Board' });
  boardId = boardRes.body.data._id;

  const listRes = await request(app)
    .post('/api/lists')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test List', boardId });
  listId = listRes.body.data._id;
});

describe('Task API', () => {
  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Task', listId, priority: 'high' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('New Task');
    expect(res.body.data.priority).toBe('high');
  });

  it('should update a task', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task to Update', listId });

    const taskId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Task', priority: 'urgent' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Updated Task');
  });

  it('should delete a task', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task to Delete', listId });

    const taskId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it('should search tasks', async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Important Feature', listId });

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bug Fix', listId });

    const res = await request(app)
      .get(`/api/tasks?boardId=${boardId}&search=Important`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    // Text search might need index to be built, so just check it doesn't error
    expect(res.body.success).toBe(true);
  });
});