const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Board = require('../src/models/Board');
jest.mock('../src/services/socketService');
jest.mock('../src/services/activityService', () => ({
  logActivity: jest.fn()
}));


let token;
let userId;


beforeEach(async () => {
  await User.deleteMany({});
  await Board.deleteMany({});

  const res = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

  token = res.body.data.token;
  userId = res.body.data.user._id;
});

describe('Board API', () => {
  describe('POST /api/boards', () => {
    it('should create a board', async () => {
      const res = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Board', description: 'A test board' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.title).toBe('Test Board');
    });
  });

  describe('GET /api/boards', () => {
    it('should return user boards with pagination', async () => {
      await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Board 1' });

      await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Board 2' });

      const res = await request(app)
        .get('/api/boards')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });
  });

  describe('GET /api/boards/:id', () => {
    it('should return board with lists and tasks', async () => {
      const createRes = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Detail Board' });

      const boardId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/boards/${boardId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.board.title).toBe('Detail Board');
      expect(res.body.data.lists).toBeDefined();
    });
  });
});