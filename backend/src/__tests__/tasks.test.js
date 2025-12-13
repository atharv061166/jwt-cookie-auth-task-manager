const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../models/User');
const Task = require('../models/Task');

const TEST_DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/intern-assignment-test';

describe('Tasks API', () => {
  let userA, userB;
  let userAToken, userBToken;
  let userATask, userBTask;

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});

    // Create two users
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);

    userA = await User.create({
      name: 'User A',
      email: 'usera@example.com',
      password: hashedPassword,
      role: 'user',
    });

    userB = await User.create({
      name: 'User B',
      email: 'userb@example.com',
      password: hashedPassword,
      role: 'user',
    });

    // Login to get tokens (cookies)
    const loginA = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'usera@example.com',
        password: 'password123',
      });

    const loginB = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'userb@example.com',
        password: 'password123',
      });

    // Extract cookies
    const cookiesA = loginA.headers['set-cookie'];
    const cookiesB = loginB.headers['set-cookie'];
    userAToken = cookiesA ? cookiesA[0] : null;
    userBToken = cookiesB ? cookiesB[0] : null;

    // Create tasks for each user
    userATask = await Task.create({
      title: 'User A Task',
      description: 'Task owned by User A',
      owner: userA._id,
      status: 'todo',
    });

    userBTask = await Task.create({
      title: 'User B Task',
      description: 'Task owned by User B',
      owner: userB._id,
      status: 'todo',
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should allow user to delete their own task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${userATask._id}`)
        .set('Cookie', userAToken)
        .expect(204);

      // Verify task is deleted
      const deletedTask = await Task.findById(userATask._id);
      expect(deletedTask).toBeNull();
    });

    it('should prevent user from deleting another user\'s task (expect 403)', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${userBTask._id}`)
        .set('Cookie', userAToken)
        .expect(403);

      expect(res.body.message).toBe('Forbidden');

      // Verify task still exists
      const task = await Task.findById(userBTask._id);
      expect(task).not.toBeNull();
      expect(task.title).toBe('User B Task');
    });

    it('should allow admin to delete any task', async () => {
      // Create admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      const adminLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      const adminCookies = adminLogin.headers['set-cookie'];
      const adminToken = adminCookies ? adminCookies[0] : null;

      const res = await request(app)
        .delete(`/api/v1/tasks/${userATask._id}`)
        .set('Cookie', adminToken)
        .expect(204);

      // Verify task is deleted
      const deletedTask = await Task.findById(userATask._id);
      expect(deletedTask).toBeNull();
    });
  });
});

