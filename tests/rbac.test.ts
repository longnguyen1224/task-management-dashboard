import request from 'supertest';

const BASE_URL = 'http://localhost:3000';

const login = async (email: string) => {
  const res = await request(BASE_URL)
    .post('/api/auth/login')
    .send({
      email,
      password: 'password123',
    });

  expect(res.status).toBe(201);
  expect(res.body.access_token).toBeDefined();

  return res.body.access_token;
};

describe('RBAC, Org Scope & Audit (E2E)', () => {
  let createdTaskId: string;

  // ---------------- AUTH ----------------
  it('OWNER can login', async () => {
    await login('owner@test.com');
  });

  // ---------------- CREATE ----------------
  it('VIEWER cannot create task', async () => {
    const token = await login('viewer@test.com');

    await request(BASE_URL)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Fail', description: 'nope' })
      .expect(403);
  });

  it('OWNER can create task', async () => {
    const token = await login('owner@test.com');

    const res = await request(BASE_URL)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Owner Task', description: 'test' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    createdTaskId = res.body.id;
  });

  // ---------------- READ ----------------
  it('VIEWER can read tasks', async () => {
    const token = await login('viewer@test.com');

    const res = await request(BASE_URL)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  // ---------------- UPDATE ----------------
  it('VIEWER cannot update task', async () => {
    const token = await login('viewer@test.com');

    await request(BASE_URL)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hack attempt' })
      .expect(403);
  });

  it('ADMIN can update task', async () => {
    const token = await login('admin@test.com');

    await request(BASE_URL)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated by admin' })
      .expect(200);
  });

  // ---------------- DELETE ----------------
  it('VIEWER cannot delete task', async () => {
    const token = await login('viewer@test.com');

    await request(BASE_URL)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('OWNER can delete task', async () => {
    const token = await login('owner@test.com');

    await request(BASE_URL)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  // ---------------- AUDIT LOG ----------------
  it('OWNER can view audit logs', async () => {
    const token = await login('owner@test.com');

    const res = await request(BASE_URL)
      .get('/api/audit-log')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('VIEWER cannot view audit logs', async () => {
    const token = await login('viewer@test.com');

    await request(BASE_URL)
      .get('/api/audit-log')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  // ---------------- SECURITY ----------------
  it('Rejects request without token', async () => {
    await request(BASE_URL)
      .get('/api/tasks')
      .expect(401);
  });

  it('Rejects invalid token', async () => {
    await request(BASE_URL)
      .get('/api/tasks')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
