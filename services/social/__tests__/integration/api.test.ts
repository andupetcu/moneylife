import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/index';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const app = createApp();

function makeToken(overrides: Record<string, unknown> = {}): string {
  return jwt.sign({ sub: 'user-1', email: 'test@test.com', role: 'player', partnerId: null, ...overrides }, JWT_SECRET, { expiresIn: '1h' });
}

const teacherToken = makeToken({ role: 'teacher', sub: 'teacher-1' });
const playerToken = makeToken();

describe('Social API — Friends', () => {
  it('GET /friends returns friends list', async () => {
    const res = await request(app).get('/friends').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('friends');
    expect(res.body.userId).toBe('user-1');
  });

  it('POST /friends creates friend request by code', async () => {
    const res = await request(app).post('/friends').set('Authorization', `Bearer ${playerToken}`).send({ code: 'ML-ALEX-7K2F' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  it('POST /friends creates friend request by userId', async () => {
    const res = await request(app).post('/friends').set('Authorization', `Bearer ${playerToken}`).send({ userId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(res.status).toBe(201);
  });

  it('POST /friends validates input', async () => {
    const res = await request(app).post('/friends').set('Authorization', `Bearer ${playerToken}`).send({});
    expect(res.status).toBe(400);
  });

  it('POST /friends/request sends friend request', async () => {
    const res = await request(app).post('/friends/request').set('Authorization', `Bearer ${playerToken}`).send({ targetUserId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body.initiatedBy).toBe('user-1');
  });

  it('PUT /friends/:id/accept accepts request', async () => {
    const res = await request(app).put('/friends/req-1/accept').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');
  });

  it('PUT /friends/:id/reject rejects request', async () => {
    const res = await request(app).put('/friends/req-1/reject').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');
  });

  it('DELETE /friends/:id removes friend', async () => {
    const res = await request(app).delete('/friends/friend-1').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(204);
  });

  it('requires auth for all friend endpoints', async () => {
    expect((await request(app).get('/friends')).status).toBe(401);
    expect((await request(app).post('/friends').send({ code: 'X' })).status).toBe(401);
  });
});

describe('Social API — Leaderboards', () => {
  it('GET /leaderboards/global returns leaderboard', async () => {
    const res = await request(app).get('/leaderboards/global').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('global');
    expect(res.body).toHaveProperty('entries');
  });

  it('GET /leaderboards/friends returns friend leaderboard', async () => {
    const res = await request(app).get('/leaderboards/friends').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('friends');
  });

  it('GET /leaderboards/classroom returns classroom leaderboard', async () => {
    const res = await request(app).get('/leaderboards/classroom?classroomId=c1').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('classroom');
  });

  it('rejects invalid leaderboard type', async () => {
    const res = await request(app).get('/leaderboards/invalid').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(400);
  });

  it('supports timeframe parameter', async () => {
    const res = await request(app).get('/leaderboards/global?timeframe=monthly').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.timeframe).toBe('monthly');
  });

  it('supports pagination', async () => {
    const res = await request(app).get('/leaderboards/global?limit=10&offset=5').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(10);
    expect(res.body.offset).toBe(5);
  });
});

describe('Social API — Classrooms', () => {
  it('POST /classrooms creates classroom for teacher', async () => {
    const res = await request(app).post('/classrooms').set('Authorization', `Bearer ${teacherToken}`).send({ name: 'Finance 101' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('joinCode');
    expect(res.body.name).toBe('Finance 101');
    expect(res.body.teacherId).toBe('teacher-1');
  });

  it('POST /classrooms rejects non-teacher', async () => {
    const res = await request(app).post('/classrooms').set('Authorization', `Bearer ${playerToken}`).send({ name: 'Test' });
    expect(res.status).toBe(403);
  });

  it('GET /classrooms/:id returns classroom', async () => {
    const res = await request(app).get('/classrooms/c1').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
  });

  it('POST /classrooms/:id/join joins classroom', async () => {
    const res = await request(app).post('/classrooms/c1/join').set('Authorization', `Bearer ${playerToken}`).send({ joinCode: 'ABC123' });
    expect(res.status).toBe(201);
    expect(res.body.userId).toBe('user-1');
  });

  it('POST /classrooms/:id/assignments creates assignment', async () => {
    const res = await request(app).post('/classrooms/c1/assignments').set('Authorization', `Bearer ${teacherToken}`).send({
      name: 'Complete Level 2',
      dueDate: '2026-03-01T00:00:00Z',
      type: 'complete_level',
      target: 2,
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Complete Level 2');
  });

  it('POST /classrooms/:id/assignments rejects non-teacher', async () => {
    const res = await request(app).post('/classrooms/c1/assignments').set('Authorization', `Bearer ${playerToken}`).send({
      name: 'Test',
      dueDate: '2026-03-01T00:00:00Z',
      type: 'custom',
    });
    expect(res.status).toBe(403);
  });

  it('GET /classrooms/:id/progress returns progress', async () => {
    const res = await request(app).get('/classrooms/c1/progress').set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('students');
  });
});
