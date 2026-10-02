// ReviewFlow AI — Phase 4 Automated Test Suite
// Tests Google Business Profile Integration, OAuth Security, Location Mapping, Review Synchronization & Reply Management

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting ReviewFlow AI Phase 4 Google Integration Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, details || '');
      failed++;
    }
  }

  try {
    // ═══════════════════════════════════════════
    // 1. SETUP USERS FOR MULTI-TENANT TESTS
    // ═══════════════════════════════════════════
    console.log('--- 1. Setting up Tenant Users ---');
    const userA_email = `google_tenant_a_${Date.now()}@example.com`;
    const userB_email = `google_tenant_b_${Date.now()}@example.com`;

    const regA = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Google Owner A', email: userA_email, password: 'Password@123' })
    }).then((r) => r.json());

    const tokenA = regA.data?.token;
    const userA_id = regA.data?.user?.id;
    assert(Boolean(tokenA && userA_id), 'User A registered and authenticated');

    const regB = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Google Owner B', email: userB_email, password: 'Password@123' })
    }).then((r) => r.json());

    const tokenB = regB.data?.token;
    const userB_id = regB.data?.user?.id;
    assert(Boolean(tokenB && userB_id), 'User B registered and authenticated');

    // ═══════════════════════════════════════════
    // 2. SETUP BUSINESS & PHYSICAL LOCATION FOR USER A
    // ═══════════════════════════════════════════
    console.log('\n--- 2. Setting up Business & Location for Tenant A ---');
    const bizA_res = await fetch(`${BASE_URL}/api/v1/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Apex Health Clinic',
        industry: 'Healthcare',
        country: 'India',
        address: '101 Health Boulevard, Sector 12',
        city: 'Chandigarh'
      })
    }).then((r) => r.json());

    const bizA_id = bizA_res.data?.id;
    assert(Boolean(bizA_id), 'Tenant A created business: Apex Health Clinic');

    const locA_res = await fetch(`${BASE_URL}/api/v1/businesses/${bizA_id}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Sector 12 Main Branch',
        address: '101 Health Boulevard',
        city: 'Chandigarh',
        state: 'Punjab',
        country: 'India'
      })
    }).then((r) => r.json());

    const locA_id = locA_res.data?.id;
    assert(Boolean(locA_id), 'Tenant A created location: Sector 12 Main Branch');

    // ═══════════════════════════════════════════
    // 3. OAUTH CONNECT & SECURITY TESTS
    // ═══════════════════════════════════════════
    console.log('\n--- 3. OAuth Connect & Security Tests ---');

    // 3.1 Unauthenticated connect rejected
    const unauthConnect = await fetch(`${BASE_URL}/api/v1/integrations/google/connect`);
    assert(unauthConnect.status === 401, 'Unauthenticated /connect rejected with HTTP 401');

    // 3.2 Authenticated connect returns URL and state
    const connectA = await fetch(`${BASE_URL}/api/v1/integrations/google/connect`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(connectA.success === true, 'Authenticated /connect succeeds');
    assert(Boolean(connectA.data?.url), '/connect returns authorization URL');
    assert(Boolean(connectA.data?.state), '/connect returns signed OAuth state');

    const validState = connectA.data.state;

    // 3.3 Callback with invalid state rejected
    const invalidCallback = await fetch(`${BASE_URL}/api/v1/integrations/google/callback?code=mock_code&state=invalid_tampered_state`);
    assert(invalidCallback.status === 400, 'Callback with tampered/invalid state returns HTTP 400');

    // 3.4 Callback with valid state completes successfully
    const validCallback = await fetch(
      `${BASE_URL}/api/v1/integrations/google/callback?code=mock_oauth_code_test&state=${encodeURIComponent(validState)}`,
      { headers: { Accept: 'application/json' } }
    ).then((r) => r.json());

    assert(validCallback.success === true, 'Callback with valid state completes token exchange');
    assert(Boolean(validCallback.data?.connection_id), 'Callback returns connection ID');

    // 3.5 Replay attack prevention: Same state cannot be reused
    const replayedCallback = await fetch(
      `${BASE_URL}/api/v1/integrations/google/callback?code=mock_oauth_code_test&state=${encodeURIComponent(validState)}`,
      { headers: { Accept: 'application/json' } }
    );
    assert(replayedCallback.status === 400, 'Replay protection: Reusing identical OAuth state returns HTTP 400');

    // ═══════════════════════════════════════════
    // 4. CONNECTION STATUS & SENSITIVE DATA LEAK PREVENTION
    // ═══════════════════════════════════════════
    console.log('\n--- 4. Connection Status & Data Leak Prevention ---');
    const statusA = await fetch(`${BASE_URL}/api/v1/integrations/google/status`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(statusA.success === true, '/status returns success');
    assert(statusA.data?.connected === true, '/status reports connected: true');
    assert(statusA.data?.connection?.status === 'active', '/status reports status: active');

    // Verify tokens are NEVER returned in API responses
    const statusPayloadString = JSON.stringify(statusA);
    assert(!statusPayloadString.includes('access_token'), 'Sensitive leak check: access_token NOT exposed in API response');
    assert(!statusPayloadString.includes('refresh_token'), 'Sensitive leak check: refresh_token NOT exposed in API response');
    assert(!statusPayloadString.includes('client_secret'), 'Sensitive leak check: client_secret NOT exposed in API response');

    // ═══════════════════════════════════════════
    // 5. GOOGLE LOCATION DISCOVERY
    // ═══════════════════════════════════════════
    console.log('\n--- 5. Google Location Discovery ---');
    const locsDiscovery = await fetch(`${BASE_URL}/api/v1/integrations/google/locations`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(locsDiscovery.success === true, 'GET /locations returned success');
    assert(Array.isArray(locsDiscovery.data) && locsDiscovery.data.length > 0, 'Discovered accessible Google locations');
    const discoveredGoogleLoc = locsDiscovery.data[0];
    assert(Boolean(discoveredGoogleLoc.google_location_id), 'Discovered location contains valid google_location_id');

    // ═══════════════════════════════════════════
    // 6. LOCATION LINKING & CROSS-TENANT SECURITY
    // ═══════════════════════════════════════════
    console.log('\n--- 6. Location Linking & Cross-Tenant Security ---');

    // 6.1 Tenant B tries to link Tenant A's physical location -> 403 Forbidden
    const attackLink = await fetch(`${BASE_URL}/api/v1/integrations/google/location-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        business_location_id: locA_id,
        google_location_id: discoveredGoogleLoc.google_location_id
      })
    });
    assert(attackLink.status === 403, 'Cross-tenant protection: Foreign user cannot link another tenant’s location (HTTP 403)');

    // 6.2 Tenant A links their own location
    const linkRes = await fetch(`${BASE_URL}/api/v1/integrations/google/location-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        business_location_id: locA_id,
        google_location_id: discoveredGoogleLoc.google_location_id,
        google_location_name: discoveredGoogleLoc.business_name,
        google_maps_url: discoveredGoogleLoc.google_maps_url
      })
    }).then((r) => r.json());

    assert(linkRes.success === true, 'Tenant A successfully linked Google location');
    const linkId = linkRes.data?.id;
    assert(Boolean(linkId), 'Created location link ID received');

    // 6.3 List location links
    const listLinks = await fetch(`${BASE_URL}/api/v1/integrations/google/location-links`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());
    assert(listLinks.success === true && listLinks.data?.length >= 1, 'GET /location-links returns active links');

    // ═══════════════════════════════════════════
    // 7. REVIEW SYNCHRONIZATION & IDEMPOTENCY
    // ═══════════════════════════════════════════
    console.log('\n--- 7. Review Synchronization & Idempotency ---');

    // 7.1 Manual review sync trigger
    const syncRes = await fetch(`${BASE_URL}/api/v1/google/sync-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ google_location_link_id: linkId })
    }).then((r) => r.json());

    assert(syncRes.success === true, 'POST /sync-reviews successfully queued/initiated sync');

    // Allow background job to run
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 7.2 Fetch reviews
    const reviewsRes1 = await fetch(`${BASE_URL}/api/v1/reviews?business_id=${bizA_id}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(reviewsRes1.success === true, 'GET /api/v1/reviews returns reviews list');
    const countAfterFirstSync = reviewsRes1.data?.reviews?.length || 0;
    assert(countAfterFirstSync > 0, `Initial sync populated ${countAfterFirstSync} reviews`);

    // 7.3 Trigger sync a SECOND time to verify IDEMPOTENCY (no duplicate records)
    await fetch(`${BASE_URL}/api/v1/google/sync-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ google_location_link_id: linkId })
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    const reviewsRes2 = await fetch(`${BASE_URL}/api/v1/reviews?business_id=${bizA_id}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    const countAfterSecondSync = reviewsRes2.data?.reviews?.length || 0;
    assert(countAfterSecondSync === countAfterFirstSync, `Idempotency verified: Repeat sync did not duplicate reviews (${countAfterSecondSync} === ${countAfterFirstSync})`);

    // ═══════════════════════════════════════════
    // 8. REVIEW QUERYING, FILTERING & ACCESS CONTROL
    // ═══════════════════════════════════════════
    console.log('\n--- 8. Review Querying, Filters & Tenant Access ---');

    // 8.1 Filter by star rating (rating=5)
    const fiveStarRes = await fetch(`${BASE_URL}/api/v1/reviews?business_id=${bizA_id}&rating=5`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    const allFiveStar = (fiveStarRes.data?.reviews || []).every((r: any) => r.star_rating === 5);
    assert(allFiveStar, 'Filter by rating=5 strictly returned 5-star reviews');

    // 8.2 Filter by reply status
    const unrepliedRes = await fetch(`${BASE_URL}/api/v1/reviews?business_id=${bizA_id}&has_reply=false`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    const allUnreplied = (unrepliedRes.data?.reviews || []).every((r: any) => r.has_reply === false);
    assert(allUnreplied, 'Filter by has_reply=false strictly returned unreplied reviews');

    // 8.3 Cross-tenant review isolation: Tenant B cannot read Tenant A reviews
    const foreignReviews = await fetch(`${BASE_URL}/api/v1/reviews?business_id=${bizA_id}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(foreignReviews.status === 403, 'Cross-tenant isolation: Tenant B cannot query Tenant A business reviews (HTTP 403)');

    // ═══════════════════════════════════════════
    // 9. OWNER REVIEW REPLY MANAGEMENT
    // ═══════════════════════════════════════════
    console.log('\n--- 9. Review Reply Management (Post, Put, Delete) ---');

    const targetReview = reviewsRes1.data.reviews[0];
    const targetReviewId = targetReview.id;

    // 9.1 Tenant B tries to reply to Tenant A review -> 403 Forbidden
    const attackReply = await fetch(`${BASE_URL}/api/v1/reviews/${targetReviewId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify({ reply: 'Unauthorized reply' })
    });
    assert(attackReply.status === 403, 'Cross-tenant protection: Foreign user cannot reply to review (HTTP 403)');

    // 9.2 Empty reply validation
    const emptyReply = await fetch(`${BASE_URL}/api/v1/reviews/${targetReviewId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ reply: '' })
    });
    assert(emptyReply.status === 422, 'Empty reply rejected with HTTP 422');

    // 9.3 Post valid owner reply
    const replyText = 'Thank you for choosing Apex Health Clinic! We appreciate your trust in our team.';
    const replyRes = await fetch(`${BASE_URL}/api/v1/reviews/${targetReviewId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ reply: replyText })
    }).then((r) => r.json());

    assert(replyRes.success === true, 'POST /reviews/:id/reply published owner reply successfully');
    assert(replyRes.data?.has_reply === true, 'Review updated with has_reply: true');
    assert(replyRes.data?.google_reply_text === replyText, 'Review record contains exact published reply text');

    // 9.4 Update owner reply
    const updatedReplyText = 'Updated response: Thank you for your wonderful feedback, Tariq!';
    const putReplyRes = await fetch(`${BASE_URL}/api/v1/reviews/${targetReviewId}/reply`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ reply: updatedReplyText })
    }).then((r) => r.json());

    assert(putReplyRes.success === true, 'PUT /reviews/:id/reply updated reply successfully');
    assert(putReplyRes.data?.google_reply_text === updatedReplyText, 'Review record contains updated reply text');

    // 9.5 Delete owner reply
    const delReplyRes = await fetch(`${BASE_URL}/api/v1/reviews/${targetReviewId}/reply`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(delReplyRes.success === true, 'DELETE /reviews/:id/reply deleted owner reply successfully');
    assert(delReplyRes.data?.has_reply === false, 'Review record reset to has_reply: false');

    // ═══════════════════════════════════════════
    // 10. GOOGLE DISCONNECT & DATA PRESERVATION
    // ═══════════════════════════════════════════
    console.log('\n--- 10. Disconnect & Data Preservation ---');

    const disconnectRes = await fetch(`${BASE_URL}/api/v1/integrations/google/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({})
    }).then((r) => r.json());

    assert(disconnectRes.success === true, 'POST /disconnect succeeds');

    // Status now reports disconnected
    const statusAfterDisconnect = await fetch(`${BASE_URL}/api/v1/integrations/google/status`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(statusAfterDisconnect.data?.connected === false, 'Status reports connected: false after disconnect');

    // Preserved reviews check: Reviews are NOT deleted when Google is disconnected!
    const reviewsAfterDisconnect = await fetch(`${BASE_URL}/api/v1/reviews?business_id=${bizA_id}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(
      (reviewsAfterDisconnect.data?.reviews?.length || 0) === countAfterSecondSync,
      `Data preservation verified: Reviews remain stored after disconnect (${reviewsAfterDisconnect.data?.reviews?.length} records preserved)`
    );

  } catch (err) {
    console.error('💥 Test suite crashed with unhandled exception:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`🏁 Phase 4 Tests Completed: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
