// ReviewFlow AI — Phase 2 Automated Test Suite

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting ReviewFlow AI Phase 2 Test Suite...\n');
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
    // 1. SETUP USERS FOR CROSS-USER TESTS
    // ═══════════════════════════════════════════
    console.log('--- 1. Setting up User A and User B ---');
    const userA_email = `usera_${Date.now()}@example.com`;
    const userB_email = `userb_${Date.now()}@example.com`;

    const regA = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A', email: userA_email, password: 'Password@123' })
    }).then((r) => r.json());

    const tokenA = regA.data?.token;
    assert(Boolean(tokenA), 'User A registered and received token');

    const regB = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: userB_email, password: 'Password@123' })
    }).then((r) => r.json());

    const tokenB = regB.data?.token;
    assert(Boolean(tokenB), 'User B registered and received token');

    // ═══════════════════════════════════════════
    // 2. BUSINESS MANAGEMENT & SLUG DEDUPLICATION
    // ═══════════════════════════════════════════
    console.log('\n--- 2. Business Management & Slugs ---');
    const bizCreate = await fetch(`${BASE_URL}/api/v1/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Sunrise Cafe',
        category: 'Restaurant & Hospitality',
        address: '100 Beach Road',
        phone: '+91 9876543210',
        website: 'https://sunrisecafe.example.com',
        google_review_url: 'https://maps.google.com/?cid=12345'
      })
    }).then((r) => r.json());

    const businessA = bizCreate.data;
    assert(Boolean(businessA?.id), 'User A created business "Sunrise Cafe"');
    assert(Boolean(businessA?.slug?.startsWith('sunrise-cafe')), 'Slug generated cleanly ("sunrise-cafe")');

    // Test duplicate slug generation
    const bizCreate2 = await fetch(`${BASE_URL}/api/v1/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Sunrise Cafe',
        address: '200 Mountain Way'
      })
    });
    // If plan limit restricts to 1 for free trial, upgrade User A or verify limit
    if (bizCreate2.status === 429) {
      console.log('  ℹ️  Plan limit correctly prevented creating a 2nd business on free tier.');
      // Upgrade User A to agency custom for test
      await fetch(`${BASE_URL}/api/v1/billing/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
        body: JSON.stringify({ plan_id: 'plan_agency_custom' })
      });
      // Retry create 2nd business with same name to test slug deduplication
      const biz2 = await fetch(`${BASE_URL}/api/v1/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
        body: JSON.stringify({ name: 'Sunrise Cafe', address: '200 Mountain Way' })
      }).then((r) => r.json());
      assert(Boolean(biz2.data?.slug?.startsWith('sunrise-cafe-')), 'Duplicate business slug auto-incremented to "sunrise-cafe-N"');
    }

    // ═══════════════════════════════════════════
    // 3. BUSINESS LOCATIONS
    // ═══════════════════════════════════════════
    console.log('\n--- 3. Business Locations CRUD ---');
    const locCreate = await fetch(`${BASE_URL}/api/v1/businesses/${businessA.id}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Downtown Branch',
        address: '456 Central Ave',
        city: 'Metropolis',
        phone: '+91 9876543211'
      })
    }).then((r) => r.json());

    const locationA = locCreate.data;
    assert(Boolean(locationA?.id), 'Created location "Downtown Branch" under Business A');

    const locList = await fetch(`${BASE_URL}/api/v1/businesses/${businessA.id}/locations`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());
    assert(locList.data?.length >= 2, 'Retrieved locations for Business A (primary + branch)');

    // ═══════════════════════════════════════════
    // 4. REVIEW FUNNELS & PUBLIC ACCESS
    // ═══════════════════════════════════════════
    console.log('\n--- 4. Review Funnels CRUD & Public Access ---');
    const funnelCreate = await fetch(`${BASE_URL}/api/v1/funnels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        business_id: businessA.id,
        location_id: locationA.id,
        name: 'Dining Room Feedback',
        title: 'How was your meal today?',
        subtitle: 'Please share your experience with us'
      })
    }).then((r) => r.json());

    const funnelA = funnelCreate.data;
    assert(Boolean(funnelA?.id), 'Created funnel under Business A');
    assert(funnelA?.slug.startsWith('dining-room-feedback'), 'Unique funnel slug generated');

    // Public funnel lookup
    const pubFunnel = await fetch(`${BASE_URL}/api/public/funnels/${funnelA.slug}`).then((r) => r.json());
    assert(pubFunnel.success === true, 'Public endpoint returned funnel without login requirement');
    assert(pubFunnel.data?.business?.name === 'Sunrise Cafe', 'Public funnel reflects business name');

    // ═══════════════════════════════════════════
    // 5. FUNNEL EVENT TRACKING
    // ═══════════════════════════════════════════
    console.log('\n--- 5. Funnel Event Tracking ---');
    const validEvent = await fetch(`${BASE_URL}/api/public/funnels/${funnelA.slug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'rating_selected',
        session_id: 'sess_test_123',
        visitor_id: 'vid_test_456',
        metadata: { rating: 5 }
      })
    });
    assert(validEvent.status === 200, 'Valid event_type (rating_selected) accepted');

    const invalidEvent = await fetch(`${BASE_URL}/api/public/funnels/${funnelA.slug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'malicious_event_injection'
      })
    });
    assert(invalidEvent.status === 422, 'Arbitrary unallowed event_type rejected (HTTP 422)');

    // ═══════════════════════════════════════════
    // 6. QR CODE MANAGEMENT & SCAN REDIRECT
    // ═══════════════════════════════════════════
    console.log('\n--- 6. QR Codes & Scan Redirect ---');
    const qrCreate = await fetch(`${BASE_URL}/api/v1/qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        business_id: businessA.id,
        funnel_id: funnelA.id,
        name: 'Table 5 QR Stand'
      })
    }).then((r) => r.json());

    const qrA = qrCreate.data;
    assert(Boolean(qrA?.id), 'Created QR code for Funnel A');
    assert(Boolean(qrA?.short_code), `Generated unique random short code: ${qrA?.short_code}`);

    // Test QR redirect at /q/:shortCode
    const qrRedirectRes = await fetch(`${BASE_URL}/q/${qrA.short_code}`, {
      redirect: 'manual'
    });
    assert(
      qrRedirectRes.status === 302,
      'GET /q/:shortCode returned HTTP 302 redirect',
      `Got status: ${qrRedirectRes.status}`
    );
    const locationHeader = qrRedirectRes.headers.get('location');
    assert(
      locationHeader === `/r/${funnelA.slug}`,
      `Redirect location matches destination funnel (/r/${funnelA.slug})`
    );

    // Verify scan count incremented
    const qrUpdated = await fetch(`${BASE_URL}/api/v1/qr/${qrA.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());
    assert(qrUpdated.data?.scan_count >= 1, `Scan count incremented: ${qrUpdated.data?.scan_count}`);

    // ═══════════════════════════════════════════
    // 7. SECURITY & MULTI-TENANT ISOLATION TESTS
    // ═══════════════════════════════════════════
    console.log('\n--- 7. Security Cross-User Access Isolation ---');

    // User B attempts to access User A's business
    const userB_bizGet = await fetch(`${BASE_URL}/api/v1/businesses/${businessA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(
      userB_bizGet.status === 403,
      `User B GET /api/v1/businesses/${businessA.id} returned HTTP 403 Forbidden`,
      `Got status: ${userB_bizGet.status}`
    );

    // User B attempts to update User A's business
    const userB_bizPut = await fetch(`${BASE_URL}/api/v1/businesses/${businessA.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ name: 'Hacked Name' })
    });
    assert(
      userB_bizPut.status === 403,
      `User B PUT /api/v1/businesses/${businessA.id} returned HTTP 403 Forbidden`,
      `Got status: ${userB_bizPut.status}`
    );

    // User B attempts to delete User A's business
    const userB_bizDel = await fetch(`${BASE_URL}/api/v1/businesses/${businessA.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(
      userB_bizDel.status === 403,
      `User B DELETE /api/v1/businesses/${businessA.id} returned HTTP 403 Forbidden`,
      `Got status: ${userB_bizDel.status}`
    );

    // User B attempts to access User A's location
    const userB_locGet = await fetch(`${BASE_URL}/api/v1/locations/${locationA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(
      userB_locGet.status === 403,
      `User B GET /api/v1/locations/${locationA.id} returned HTTP 403 Forbidden`
    );

    // User B attempts to access User A's funnel
    const userB_fnlGet = await fetch(`${BASE_URL}/api/v1/funnels/${funnelA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(
      userB_fnlGet.status === 403,
      `User B GET /api/v1/funnels/${funnelA.id} returned HTTP 403 Forbidden`
    );

    // User B attempts to access User A's QR code
    const userB_qrGet = await fetch(`${BASE_URL}/api/v1/qr/${qrA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(
      userB_qrGet.status === 403,
      `User B GET /api/v1/qr/${qrA.id} returned HTTP 403 Forbidden`
    );

    console.log('\n=============================================');
    console.log(`Phase 2 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('=============================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  }
}

runTests();
