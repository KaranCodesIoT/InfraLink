import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';

describe('Auth Integration', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI);
    });

    afterAll(async () => {
        await mongoose.connection.db.dropCollection('users').catch(() => { });
        await mongoose.disconnect();
    });

    const testUser = { name: 'Test User', email: `test_${Date.now()}@infralink.com`, password: 'Password123!', role: 'client' };

    it('POST /api/v1/auth/register should register a user', async () => {
        const res = await request(app).post('/api/v1/auth/register').send(testUser);
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
    });

    it('POST /api/v1/auth/login should login the user', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
        expect(res.statusCode).toBe(200);
        expect(res.body.data.accessToken).toBeDefined();
    });

    it('POST /api/v1/auth/login should reject wrong password', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: 'wrongpass' });
        expect(res.statusCode).toBe(401);
    });
});
