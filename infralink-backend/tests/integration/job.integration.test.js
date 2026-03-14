import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';

describe('Jobs Integration', () => {
    let accessToken;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI);
        // Register and login a client
        const res = await request(app).post('/api/v1/auth/register').send({
            name: 'Job Client', email: `jobclient_${Date.now()}@infralink.com`, password: 'Password123!', role: 'client',
        });
        accessToken = res.body.data?.accessToken;
    });

    afterAll(async () => {
        await mongoose.connection.db.dropCollection('jobs').catch(() => { });
        await mongoose.connection.db.dropCollection('users').catch(() => { });
        await mongoose.disconnect();
    });

    it('POST /api/v1/jobs should create a job', async () => {
        const res = await request(app)
            .post('/api/v1/jobs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'Need a Plumber', description: 'Fix the leaking pipe in basement urgently.', requiredSkills: ['plumbing'] });
        expect(res.statusCode).toBe(201);
        expect(res.body.data.title).toBe('Need a Plumber');
    });

    it('GET /api/v1/jobs should list jobs', async () => {
        const res = await request(app).get('/api/v1/jobs').set('Authorization', `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
