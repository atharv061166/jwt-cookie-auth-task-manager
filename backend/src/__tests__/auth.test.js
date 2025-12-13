const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../models/User');

const TEST_DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/intern-assignment-test';

describe('Auth API', () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and set httpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'user',
        })
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.name).toBe('Test User');
      expect(res.body).not.toHaveProperty('token'); // Token should not be in response body

      // Check for httpOnly cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const accessCookie = cookies.find((cookie) => cookie.startsWith('access_token='));
      expect(accessCookie).toBeDefined();
      expect(accessCookie).toContain('HttpOnly');
    });

    it('should return 400 if email already exists', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashedpassword',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123',
        })
        .expect(400);

      expect(res.body.message).toContain('already registered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
      });
    });

    it('should login user and set httpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body).not.toHaveProperty('token'); // Token should not be in response body

      // Check for httpOnly cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const accessCookie = cookies.find((cookie) => cookie.startsWith('access_token='));
      expect(accessCookie).toBeDefined();
      expect(accessCookie).toContain('HttpOnly');
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body.message).toContain('Invalid credentials');
    });
  });
});

