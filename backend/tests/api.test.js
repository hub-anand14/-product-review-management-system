import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Review from '../src/models/Review.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'super-secret-test-jwt-key-with-high-entropy-12345';
const TEST_MONGO_URI = 'mongodb://127.0.0.1:27018/reviewhub_test';

let server;
let baseUrl;

const runTests = async () => {
  console.log('--- Starting Backend Integration Test Suite ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      failed++;
      throw new Error(message);
    } else {
      console.log(`✅ PASSED: ${message}`);
      passed++;
    }
  };

  try {

    await mongoose.connect(TEST_MONGO_URI);
    console.log('[Test Setup] Connected to test MongoDB');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}/api`;
        console.log(`[Test Setup] Test server listening on ${baseUrl}`);
        resolve();
      });
    });

    {
      const res = await fetch(`${baseUrl}/health`);
      const body = await res.json();
      assert(res.status === 200, 'GET /api/health returns HTTP 200');
      assert(body.status === 'ok', 'GET /api/health body.status is "ok"');
    }

    let user1Token, user1Id;
    {

      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Regular Alice',
          email: 'alice@example.com',
          password: 'Password123',
          role: 'admin',
        }),
      });
      const body = await res.json();
      assert(res.status === 201, 'POST /api/auth/register returns HTTP 201');
      assert(body.token, 'Registration returns JWT token');
      assert(body.user && body.user.role === 'user', 'Public registration forces role "user" despite exploit attempt');
      assert(!body.user.password, 'Password hash is NOT exposed in response');
      user1Token = body.token;
      user1Id = body.user._id;
    }

    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Alice Impostor',
          email: 'ALICE@example.com',
          password: 'Password123',
        }),
      });
      const body = await res.json();
      assert(res.status === 400, 'POST /api/auth/register rejects duplicate email with HTTP 400');
      assert(body.message.includes('User already exists'), 'Returns duplicate user error message');
    }

    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'A',
          email: 'invalid-email',
          password: '123',
        }),
      });
      assert(res.status === 400, 'POST /api/auth/register rejects invalid inputs with HTTP 400');
    }

    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alice@example.com',
          password: 'Password123',
        }),
      });
      const body = await res.json();
      assert(res.status === 200, 'POST /api/auth/login returns HTTP 200');
      assert(body.token, 'Login returns JWT token');
      assert(body.user.email === 'alice@example.com', 'Login returns user profile');
    }

    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alice@example.com',
          password: 'WrongPassword',
        }),
      });
      assert(res.status === 401, 'POST /api/auth/login rejects incorrect password with HTTP 401');
    }

    let user2Token, user2Id;
    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Bob Reviewer',
          email: 'bob@example.com',
          password: 'Password123',
        }),
      });
      const body = await res.json();
      assert(res.status === 201, 'Registered second normal user (Bob)');
      user2Token = body.token;
      user2Id = body.user._id;
    }

    let adminToken, adminId;
    {
      const admin = await User.create({
        name: 'System Admin',
        email: 'admin@reviewhub.local',
        password: 'AdminPassword123',
        role: 'admin',
      });
      adminId = admin._id;

      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@reviewhub.local',
          password: 'AdminPassword123',
        }),
      });
      const body = await res.json();
      assert(res.status === 200 && body.user.role === 'admin', 'Admin user logs in successfully');
      adminToken = body.token;
    }

    let productId;
    {

      const resNoAuth = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Noise Cancelling Headphones',
          category: 'Audio',
          price: 199.99,
          description: 'High fidelity audio headphones with active noise cancellation.',
        }),
      });
      assert(resNoAuth.status === 401, 'POST /api/products without token returns HTTP 401');

      const resNormalUser = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          name: 'Noise Cancelling Headphones',
          category: 'Audio',
          price: 199.99,
          description: 'High fidelity audio headphones with active noise cancellation.',
        }),
      });
      assert(resNormalUser.status === 403, 'POST /api/products by normal user returns HTTP 403');

      const resAdmin = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Noise Cancelling Headphones',
          category: 'Audio',
          price: 199.99,
          description: 'High fidelity audio headphones with active noise cancellation.',
        }),
      });
      const productBody = await resAdmin.json();
      assert(resAdmin.status === 201, 'POST /api/products by admin returns HTTP 201');
      assert(productBody._id, 'Created product contains _id');
      assert(productBody.averageRating === 0 && productBody.numReviews === 0, 'New product initial rating is 0 with 0 reviews');
      productId = productBody._id;
    }

    {

      const resList = await fetch(`${baseUrl}/products`);
      const listBody = await resList.json();
      assert(resList.status === 200, 'GET /api/products returns HTTP 200');
      assert(Array.isArray(listBody) && listBody.length === 1, 'GET /api/products returns array with product');

      const resSingle = await fetch(`${baseUrl}/products/${productId}`);
      const singleBody = await resSingle.json();
      assert(resSingle.status === 200, 'GET /api/products/:id returns HTTP 200');
      assert(singleBody.name === 'Noise Cancelling Headphones', 'Product details match created product');

      const resInvalid = await fetch(`${baseUrl}/products/invalid-object-id`);
      assert(resInvalid.status === 400, 'GET /api/products/:invalidId returns HTTP 400');

      const resNonExistent = await fetch(`${baseUrl}/products/507f1f77bcf86cd799439011`);
      assert(resNonExistent.status === 404, 'GET /api/products/:nonExistentId returns HTTP 404');
    }

    {

      const resDenied = await fetch(`${baseUrl}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ price: 149.99 }),
      });
      assert(resDenied.status === 403, 'PUT /api/products/:id by normal user returns HTTP 403');

      const resAdminUpdate = await fetch(`${baseUrl}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ price: 179.99 }),
      });
      const updatedBody = await resAdminUpdate.json();
      assert(resAdminUpdate.status === 200, 'PUT /api/products/:id by admin returns HTTP 200');
      assert(updatedBody.price === 179.99, 'Product price updated successfully');
    }

    let review1Id;
    {

      const resEmptyReviews = await fetch(`${baseUrl}/products/${productId}/reviews`);
      const emptyBody = await resEmptyReviews.json();
      assert(resEmptyReviews.status === 200 && emptyBody.length === 0, 'Initial review list is empty');

      const resNoAuth = await fetch(`${baseUrl}/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 4, comment: 'Great sound quality!' }),
      });
      assert(resNoAuth.status === 401, 'POST review without token returns HTTP 401');

      const resInvalidRating = await fetch(`${baseUrl}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ rating: 6, comment: 'Illegal rating' }),
      });
      assert(resInvalidRating.status === 400, 'POST review with rating 6 rejected with HTTP 400');

      const resFloatRating = await fetch(`${baseUrl}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ rating: 3.5, comment: 'Float rating' }),
      });
      assert(resFloatRating.status === 400, 'POST review with non-integer rating rejected with HTTP 400');

      const resEmptyComment = await fetch(`${baseUrl}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ rating: 5, comment: '' }),
      });
      assert(resEmptyComment.status === 400, 'POST review with empty comment rejected with HTTP 400');

      const resValidReview = await fetch(`${baseUrl}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ rating: 4, comment: 'Great sound quality and comfort!' }),
      });
      const reviewBody = await resValidReview.json();
      assert(resValidReview.status === 201, 'POST review by User 1 returns HTTP 201');
      assert(reviewBody._id && reviewBody.rating === 4, 'Review created with correct fields');
      assert(reviewBody.user && reviewBody.user.name === 'Regular Alice', 'Review response includes populated user object with name');
      review1Id = reviewBody._id;

      const resProdAfterR1 = await fetch(`${baseUrl}/products/${productId}`);
      const prodBodyAfterR1 = await resProdAfterR1.json();
      assert(prodBodyAfterR1.numReviews === 1, 'Product numReviews updated to 1');
      assert(prodBodyAfterR1.averageRating === 4, 'Product averageRating updated to 4.0');

      const resDup = await fetch(`${baseUrl}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ rating: 5, comment: 'Second review attempt' }),
      });
      assert(resDup.status === 400, 'Duplicate review attempt by same user rejected with HTTP 400');

      const resR2 = await fetch(`${baseUrl}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user2Token}`,
        },
        body: JSON.stringify({ rating: 5, comment: 'Best headphones I have ever owned.' }),
      });
      assert(resR2.status === 201, 'User 2 creates review with rating 5');

      const resProdAfterR2 = await fetch(`${baseUrl}/products/${productId}`);
      const prodBodyAfterR2 = await resProdAfterR2.json();
      assert(prodBodyAfterR2.numReviews === 2, 'Product numReviews updated to 2');
      assert(prodBodyAfterR2.averageRating === 4.5, 'Product averageRating accurately recalculated to 4.5');
    }

    {

      const resUnauthorizedEdit = await fetch(`${baseUrl}/reviews/${review1Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user2Token}`,
        },
        body: JSON.stringify({ rating: 1, comment: 'Malicious edit by someone else' }),
      });
      assert(resUnauthorizedEdit.status === 403, 'Unauthorized user editing someone else review is blocked with HTTP 403');

      const resOwnerEdit = await fetch(`${baseUrl}/reviews/${review1Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ rating: 1, comment: 'Actually broke after 2 days.' }),
      });
      assert(resOwnerEdit.status === 200, 'Owner editing their own review succeeds with HTTP 200');

      const resProdAfterEdit = await fetch(`${baseUrl}/products/${productId}`);
      const prodBodyAfterEdit = await resProdAfterEdit.json();
      assert(prodBodyAfterEdit.numReviews === 2, 'Product numReviews remains 2');
      assert(prodBodyAfterEdit.averageRating === 3, 'Product averageRating dynamically updated to 3.0');
    }

    {

      const resUnauthorizedDelete = await fetch(`${baseUrl}/reviews/${review1Id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
      });
      assert(resUnauthorizedDelete.status === 403, 'Unauthorized user deleting someone else review is blocked with HTTP 403');

      const resOwnerDelete = await fetch(`${baseUrl}/reviews/${review1Id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });
      assert(resOwnerDelete.status === 200, 'Owner deleting their own review succeeds with HTTP 200');

      const resProdAfterDel = await fetch(`${baseUrl}/products/${productId}`);
      const prodBodyAfterDel = await resProdAfterDel.json();
      assert(prodBodyAfterDel.numReviews === 1, 'Product numReviews updated to 1');
      assert(prodBodyAfterDel.averageRating === 5, 'Product averageRating dynamically updated to 5.0');
    }

    {

      const resNormalDel = await fetch(`${baseUrl}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });
      assert(resNormalDel.status === 403, 'Normal user deleting product is blocked with HTTP 403');

      const resAdminDel = await fetch(`${baseUrl}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      assert(resAdminDel.status === 200, 'Admin deleting product succeeds with HTTP 200');

      const resCheckProd = await fetch(`${baseUrl}/products/${productId}`);
      assert(resCheckProd.status === 404, 'Deleted product is no longer found (HTTP 404)');

      const remainingReviews = await Review.find({ productId });
      assert(remainingReviews.length === 0, 'Associated reviews were automatically cleaned up on product deletion');
    }

    console.log(`\n🎉 ALL TESTS PASSED! Summary: ${passed} passed, ${failed} failed.`);
    process.exitCode = 0;
  } catch (err) {
    console.error(`\n💥 Test suite stopped due to error: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
  }
};

runTests();
