import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

describe('ReviewFlow AI Authentication & RBAC Verification', async () => {
  let userToken: string;
  let adminToken: string;

  // 1. LOGIN TESTS
  it('Login with valid user credentials should succeed and return JWT', async () => {
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ahmadfaizan1999@gmail.com',
        password: 'Password@123'
      })
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.token, 'Token must be present in login response');
    assert.strictEqual(res.data.data.user.email, 'ahmadfaizan1999@gmail.com');
    assert.strictEqual(res.data.data.user.password_hash, undefined, 'Password hash must never be exposed');
    userToken = res.data.data.token;
  });

  it('Login with invalid credentials should return 401', async () => {
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ahmadfaizan1999@gmail.com',
        password: 'WrongPassword@999'
      })
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  it('Login with non-existent user should return 401', async () => {
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nobody_exists_12345@example.com',
        password: 'Password@123'
      })
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  it('Login with admin credentials should succeed and return admin token', async () => {
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@reviewflowai.in',
        password: 'Admin@123456'
      })
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.role, 'admin');
    assert.ok(res.data.data.token);
    adminToken = res.data.data.token;
  });

  // 2. PROTECTED ENDPOINT TESTS (GET /api/v1/auth/me)
  it('GET /api/v1/auth/me without token should return 401', async () => {
    const res = await request('/api/v1/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'Authentication required. Please provide a valid Bearer token.');
  });

  it('GET /api/v1/auth/me with invalid token should return 401', async () => {
    const res = await request('/api/v1/auth/me', {
      headers: { Authorization: 'Bearer this_is_a_completely_fake_invalid_token' }
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'Invalid or expired authentication session token.');
  });

  it('GET /api/v1/auth/me with valid Bearer token should return 200 and user profile', async () => {
    const res = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.email, 'ahmadfaizan1999@gmail.com');
  });

  // 3. AUTHORIZATION & RBAC TESTS
  it('Normal user attempting to access Admin API should receive 403 Forbidden', async () => {
    const res = await request('/api/v1/admin/dashboard', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'Access denied: Administrative privileges required.');
  });

  it('Admin user accessing Admin API should receive 200 OK', async () => {
    const res = await request('/api/v1/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.users);
    assert.ok(res.data.data.billing);
  });

  // 4. PUBLIC FUNNEL TESTS
  it('Public funnel endpoint /api/public/funnels/:slug should succeed without token', async () => {
    const res = await request('/api/public/funnels/muzaffarabad-reviews');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.funnel.slug, 'muzaffarabad-reviews');
  });

  it('Public funnel event tracking /api/public/funnels/:slug/event should succeed without token', async () => {
    const res = await request('/api/public/funnels/muzaffarabad-reviews/event', {
      method: 'POST',
      body: JSON.stringify({
        event_type: 'page_view'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // 5. PROTECTED BUSINESS & DASHBOARD APIS
  it('GET /api/v1/businesses with valid token should succeed', async () => {
    const res = await request('/api/v1/businesses', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
  });

  it('GET /api/v1/dashboard/stats with valid token should succeed', async () => {
    const res = await request('/api/v1/dashboard/stats', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  it('GET /api/v1/funnels with valid token should succeed', async () => {
    const res = await request('/api/v1/funnels', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
  });

  // 6. LOGOUT
  it('POST /api/v1/auth/logout with token should return 200', async () => {
    const res = await request('/api/v1/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  it('POST /api/v1/auth/logout without token should return 401', async () => {
    const res = await request('/api/v1/auth/logout', {
      method: 'POST'
    });
    assert.strictEqual(res.status, 401);
  });
});
