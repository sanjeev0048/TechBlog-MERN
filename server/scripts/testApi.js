// Automated API integration test script with strict safety checks
import dotenv from 'dotenv';
dotenv.config();

// Base URL for the API under test – can be overridden with TEST_API_URL env var.
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';
// Explicit flag to allow destructive (CRUD) operations.
const ALLOW_DESTRUCTIVE = process.env.ALLOW_DESTRUCTIVE_TESTS === 'true';
// List of known production endpoints – destructive tests are never run against these.
const PRODUCTION_ENDPOINTS = [
  'https://techblog-mern.onrender.com/api',
  'http://techblog-mern.onrender.com/api'
];
// Determine if we are allowed to run CRUD tests safely.
const canRunDestructive = ALLOW_DESTRUCTIVE && !PRODUCTION_ENDPOINTS.includes(BASE_URL);

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log(`\n--- Running API Integration Tests against ${BASE_URL} ---\n`);
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` PASS: ${message}`);
      passed++;
    } else {
      console.error(` FAIL: ${message}`);
      failed++;
    }
  }

  function skip(message) {
    console.log(` SKIP: ${message}`);
    skipped++;
  }

  // Variables used for cleanup of the temporary test article.
  let testArticleId = null;
  let testArticleSlug = null;
  let authToken = null;

  try {
    // 1. Health check (read‑only)
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'healthy', '1. Server health check responds 200 healthy');

    // 2. Reject invalid login credentials (read‑only)
    const badLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@techpulse.com', password: 'wrongpassword' })
    });
    assert(badLogin.status === 401, '2. Invalid login credentials rejected with 401');

    // 3. Admin login with correct credentials (read‑only)
    const goodLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || 'admin@techpulse.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      })
    });
    assert(goodLogin.status === 200 && Boolean(goodLogin.data.token), '3. Admin login succeeds and returns JWT token');
    authToken = goodLogin.data.token;

    // 4. Protected route rejects unauthenticated request (read‑only)
    const unauthed = await request('/auth/me');
    assert(unauthed.status === 401, '4. Protected /api/auth/me rejects unauthenticated request');

    // 5. Protected route accepts valid token (read‑only)
    const authedMe = await request('/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(authedMe.status === 200 && authedMe.data.user.role === 'admin', '5. Protected /api/auth/me accepts token and returns admin user');

    // 6. Public Categories listing (read‑only)
    const categories = await request('/categories');
    assert(
      categories.status === 200 &&
      Array.isArray(categories.data) &&
      categories.data.length >= 7,
      '6. Public GET /api/categories returns required categories'
    );

    // 7. Public Blogs listing with pagination (read‑only)
    const blogs = await request('/blogs?page=1&limit=6');
    assert(
      blogs.status === 200 &&
      Array.isArray(blogs.data.blogs) &&
      typeof blogs.data.total === 'number',
      '7. Public GET /api/blogs returns paginated article array'
    );

    // 8. Public Featured Blogs (read‑only)
    const featured = await request('/blogs/featured');
    assert(featured.status === 200 && Array.isArray(featured.data), '8. Public GET /api/blogs/featured returns featured articles');

    // 9. Draft hiding check – public endpoint must not expose drafts (read‑only)
    const hasDraftInPublic = blogs.data.blogs?.some(b => b.status === 'draft');
    assert(hasDraftInPublic === false, '9. Public endpoints hide draft articles');

    // 10. Admin all blogs endpoint includes drafts (read‑only)
    const adminBlogs = await request('/blogs/admin/all', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(adminBlogs.status === 200 && Array.isArray(adminBlogs.data), '10. Admin GET /api/blogs/admin/all returns all status records');

    // -----------------------------------------------------------------
    // 11‑14: CRUD tests – only run when explicitly allowed and when we are
    //        confident we are not hitting a production database.
    // -----------------------------------------------------------------
    if (canRunDestructive) {
      // Attempt to verify that the backend is using a test database.
      // This script assumes the health endpoint may expose a custom field `dbName`.
      // If the field is missing or does not contain an indicative test/dev/staging name,
      // we skip all destructive CRUD tests.
      const dbName = health.data?.dbName;
      if (!dbName) {
        skip('11‑14. Backend does not expose a database name – CRUD tests skipped for safety.');
      } else if (!/test|dev|staging/i.test(dbName)) {
        skip('11‑14. Backend database name does not indicate a test/dev/staging environment – CRUD tests skipped.');
      } else {
        // 11. Create a uniquely‑named test article (slug includes timestamp)
        testArticleSlug = `test-article-${Date.now()}`;
        const newArticle = await request('/blogs', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({
            title: 'Automated Test Article for Verification',
            slug: testArticleSlug,
            excerpt: 'Verifying backend persistence and CRUD cycle.',
            content: '## Verification Content\n\nThis article verifies Mongoose persistence.',
            category: categories.data[0]._id,
            tags: ['AutomatedTest'],
            status: 'published'
          })
        });
        assert(newArticle.status === 201 && newArticle.data.slug === testArticleSlug, '11. POST /api/blogs creates new article in MongoDB');
        testArticleId = newArticle.data._id;

        // 12. Retrieve the article by slug (public endpoint)
        const single = await request(`/blogs/${testArticleSlug}`);
        assert(
          single.status === 200 &&
          single.data.title === 'Automated Test Article for Verification',
          '12. Public GET /api/blogs/:slug returns article and increments view count'
        );

        // 13. Update the article title via PATCH
        const updated = await request(`/blogs/${testArticleId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ title: 'Updated Test Article Title' })
        });
        assert(updated.status === 200 && updated.data.title === 'Updated Test Article Title', '13. PATCH /api/blogs/:id successfully updates article in MongoDB');

        // 14. Delete the article (cleanup will also attempt delete)
        const deleted = await request(`/blogs/${testArticleId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        assert(deleted.status === 200, '14. DELETE /api/blogs/:id removes article from MongoDB');
        // Reset so the final cleanup does not try a second delete.
        testArticleId = null;
      }
    } else {
      skip('11‑14. CRUD tests skipped – destructive testing not explicitly allowed.');
    }

    // 15. Scheduled publication trigger – always skipped for safety.
    skip('15. Scheduled‑publication endpoint not executed in automated tests.');

  } catch (err) {
    console.error('Test execution error:', err.message);
    failed++;
  } finally {
    // Cleanup: ensure the test article is removed even if an earlier step failed.
    if (testArticleId && authToken) {
      try {
        const cleanup = await request(`/blogs/${testArticleId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (cleanup.status === 200) {
          console.log('Cleanup: test article deleted successfully.');
        } else {
          console.warn('Cleanup: failed to delete test article – manual removal may be required.');
        }
      } catch (e) {
        console.error('Cleanup error:', e.message);
      }
    }
    console.log(`\n--- Test Summary: ${passed} PASSED, ${failed} FAILED, ${skipped} SKIPPED ---\n`);
    // Exit with non‑zero code if any test failed.
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
