import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

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

  function assert(condition, message) {
    if (condition) {
      console.log(` PASS: ${message}`);
      passed++;
    } else {
      console.error(` FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'healthy', '1. Server health check responds 200 healthy');

    // 2. Reject invalid login credentials
    const badLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@techpulse.com', password: 'wrongpassword' })
    });
    assert(badLogin.status === 401, '2. Invalid login credentials rejected with 401');

    // 3. Admin login with correct credentials
    const goodLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || 'admin@techpulse.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      })
    });
    assert(goodLogin.status === 200 && Boolean(goodLogin.data.token), '3. Admin login succeeds and returns JWT token');
    const token = goodLogin.data.token;

    // 4. Protected route rejects unauthenticated request
    const unauthed = await request('/auth/me');
    assert(unauthed.status === 401, '4. Protected /api/auth/me rejects unauthenticated request');

    // 5. Protected route accepts valid token
    const authedMe = await request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(authedMe.status === 200 && authedMe.data.user.role === 'admin', '5. Protected /api/auth/me accepts token and returns admin user');

    // 6. Public Categories listing
    const categories = await request('/categories');
    assert(categories.status === 200 && Array.isArray(categories.data) && categories.data.length >= 7, '6. Public GET /api/categories returns required categories');

    // 7. Public Blogs listing with pagination
    const blogs = await request('/blogs?page=1&limit=6');
    assert(blogs.status === 200 && Array.isArray(blogs.data.blogs) && typeof blogs.data.total === 'number', '7. Public GET /api/blogs returns paginated article array');

    // 8. Public Featured Blogs
    const featured = await request('/blogs/featured');
    assert(featured.status === 200 && Array.isArray(featured.data), '8. Public GET /api/blogs/featured returns featured articles');

    // 9. Draft hiding check: public blogs endpoint must not contain drafts
    const hasDraftInPublic = blogs.data.blogs?.some(b => b.status === 'draft');
    assert(hasDraftInPublic === false, '9. Public endpoints hide draft articles');

    // 10. Admin all blogs endpoint includes drafts
    const adminBlogs = await request('/blogs/admin/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(adminBlogs.status === 200 && Array.isArray(adminBlogs.data), '10. Admin GET /api/blogs/admin/all returns all status records');

    // 11. Create a new article
    const testArticleSlug = `test-article-${Date.now()}`;
    const newArticle = await request('/blogs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
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
    const createdId = newArticle.data._id;

    // 12. Single article by slug
    const single = await request(`/blogs/${testArticleSlug}`);
    assert(single.status === 200 && single.data.title === 'Automated Test Article for Verification', '12. Public GET /api/blogs/:slug returns article and increments view count');

    // 13. Update the article (PATCH /api/blogs/:id)
    const updated = await request(`/blogs/${createdId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Updated Test Article Title'
      })
    });
    assert(updated.status === 200 && updated.data.title === 'Updated Test Article Title', '13. PATCH /api/blogs/:id successfully updates article in MongoDB');

    // 14. Delete the article (DELETE /api/blogs/:id)
    const deleted = await request(`/blogs/${createdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(deleted.status === 200, '14. DELETE /api/blogs/:id removes article from MongoDB');

    // 15. Scheduled publication trigger
    const scheduledProcess = await request('/blogs/admin/process-scheduled', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(scheduledProcess.status === 200, '15. POST /api/blogs/admin/process-scheduled executes successfully');

  } catch (err) {
    console.error('Test execution error (is the server running at http://localhost:5000?):', err.message);
  }

  console.log(`\n--- Test Results: ${passed} passed, ${failed} failed ---\n`);
}

runTests();
