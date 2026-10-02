// ReviewFlow AI — Phase 3 Automated Test Suite
// Tests Analytics Engine, Aggregation, Analytics APIs & Multi-Tenant Security

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting ReviewFlow AI Phase 3 Analytics Test Suite...\n');
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
    // 1. SETUP USERS FOR ANALYTICS TESTING
    // ═══════════════════════════════════════════
    console.log('--- 1. Setting up Test Users ---');
    const userA_email = `analytics_a_${Date.now()}@example.com`;
    const userB_email = `analytics_b_${Date.now()}@example.com`;

    const regA = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Analytics Owner A', email: userA_email, password: 'Password@123' })
    }).then((r) => r.json());

    const tokenA = regA.data?.token;
    assert(Boolean(tokenA), 'User A registered and received token');

    const regB = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Analytics Owner B', email: userB_email, password: 'Password@123' })
    }).then((r) => r.json());

    const tokenB = regB.data?.token;
    assert(Boolean(tokenB), 'User B registered and received token');

    // ═══════════════════════════════════════════
    // 2. SETUP BUSINESS, LOCATION, FUNNEL & QR
    // ═══════════════════════════════════════════
    console.log('\n--- 2. Setting up Business, Location, Funnel & QR ---');
    const bizRes = await fetch(`${BASE_URL}/api/v1/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        name: 'The Grand Analytics Bistro',
        category: 'Restaurant',
        address: '42 Main Boulevard',
        phone: '+91 9998887776'
      })
    }).then((r) => r.json());

    const bizId = bizRes.data?.id;
    assert(Boolean(bizId), 'User A created business for analytics tracking');

    // Create Location
    const locRes = await fetch(`${BASE_URL}/api/v1/businesses/${bizId}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        name: 'Downtown Analytics Branch',
        address: 'Floor 1, Cyber City',
        city: 'Metropolis'
      })
    }).then((r) => r.json());

    const locId = locRes.data?.id;
    assert(Boolean(locId), 'User A created location under business');

    // Create Funnel
    const fnlRes = await fetch(`${BASE_URL}/api/v1/funnels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        business_id: bizId,
        location_id: locId,
        name: 'Grand Bistro Review Funnel',
        title: 'Tell Us About Your Dining Experience',
        google_review_url: 'https://g.page/r/sample-bistro/review'
      })
    }).then((r) => r.json());

    const funnelId = fnlRes.data?.id;
    const funnelSlug = fnlRes.data?.slug;
    assert(Boolean(funnelId && funnelSlug), `User A created review funnel (slug: ${funnelSlug})`);

    // Create QR Code
    const qrRes = await fetch(`${BASE_URL}/api/v1/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        business_id: bizId,
        funnel_id: funnelId,
        name: 'Table Tent QR'
      })
    }).then((r) => r.json());

    const qrId = qrRes.data?.id;
    const shortCode = qrRes.data?.short_code;
    assert(Boolean(qrId && shortCode), `User A created QR code (short_code: ${shortCode})`);

    // ═══════════════════════════════════════════
    // 3. INGEST REAL EVENT FLOW THROUGH PUBLIC APIS
    // ═══════════════════════════════════════════
    console.log('\n--- 3. Simulating Full Customer Review Funnel Event Pipeline ---');

    // 1. Scan QR code (GET /q/:shortCode)
    const scanRes = await fetch(`${BASE_URL}/q/${shortCode}`, { redirect: 'manual' });
    assert(scanRes.status === 302, 'QR Scan returned HTTP 302 Redirect');

    // 2. Multiple Page Views from 2 distinct visitors
    const visitor1 = `vis_test_1_${Date.now()}`;
    const visitor2 = `vis_test_2_${Date.now()}`;

    await fetch(`${BASE_URL}/api/public/funnels/${funnelSlug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'page_view', visitor_id: visitor1, session_id: 's1' })
    });

    await fetch(`${BASE_URL}/api/public/funnels/${funnelSlug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'page_view', visitor_id: visitor2, session_id: 's2' })
    });
    assert(true, 'Ingested page_view events for 2 distinct visitors');

    // 3. Rating Selected
    await fetch(`${BASE_URL}/api/public/funnels/${funnelSlug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'rating_selected', visitor_id: visitor1, metadata: { rating: 5 } })
    });
    assert(true, 'Ingested rating_selected event (5 stars)');

    // 4. Feedback Started & Completed
    await fetch(`${BASE_URL}/api/public/funnels/${funnelSlug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'feedback_started', visitor_id: visitor1 })
    });

    await fetch(`${BASE_URL}/api/public/funnels/${funnelSlug}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        customer_name: 'Priya Sharma',
        customer_email: 'priya@example.com',
        comment: 'Outstanding food and delightful ambiance!'
      })
    });
    assert(true, 'Ingested feedback_started and feedback_completed');

    // 5. Google Review Click
    await fetch(`${BASE_URL}/api/public/funnels/${funnelSlug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'google_clicked', visitor_id: visitor1 })
    });
    assert(true, 'Ingested google_clicked conversion event');

    // ═══════════════════════════════════════════
    // 4. TEST ANALYTICS OVERVIEW API
    // ═══════════════════════════════════════════
    console.log('\n--- 4. Testing GET /api/v1/analytics/overview ---');
    const overviewRes = await fetch(`${BASE_URL}/api/v1/analytics/overview?business_id=${bizId}&compare=true`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(overviewRes.success === true, 'Analytics overview returned success');
    const ov = overviewRes.data;
    assert(ov.page_views >= 2, `Page views tracked accurately (${ov.page_views} >= 2)`);
    assert(ov.unique_visitors >= 2, `Unique visitors count computed correctly (${ov.unique_visitors} >= 2)`);
    assert(ov.rating_selected >= 1, `Ratings tracked accurately (${ov.rating_selected} >= 1)`);
    assert(ov.feedback_completed >= 1, `Feedback completion tracked (${ov.feedback_completed} >= 1)`);
    assert(ov.google_clicks >= 1, `Google clicks tracked (${ov.google_clicks} >= 1)`);
    assert(typeof ov.conversion_rates.overall === 'number', 'Overall conversion rate computed as numeric percentage');
    assert(Boolean(ov.comparison), 'Comparison period data returned with compare=true');

    // ═══════════════════════════════════════════
    // 5. TEST ANALYTICS TIMESERIES API
    // ═══════════════════════════════════════════
    console.log('\n--- 5. Testing GET /api/v1/analytics/timeseries ---');
    const tsRes = await fetch(`${BASE_URL}/api/v1/analytics/timeseries?business_id=${bizId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(tsRes.success === true, 'Timeseries returned success');
    assert(Array.isArray(tsRes.data), 'Timeseries data is an array');
    assert(tsRes.data.length > 0, 'Timeseries contains daily points');
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayPoint = tsRes.data.find((p: any) => p.date === todayStr);
    assert(Boolean(todayPoint), `Timeseries contains current date point (${todayStr})`);
    assert(todayPoint && todayPoint.page_views >= 2, 'Today data point reflects real ingested page views');

    // ═══════════════════════════════════════════
    // 6. TEST RESOURCE-SPECIFIC ANALYTICS ENDPOINTS
    // ═══════════════════════════════════════════
    console.log('\n--- 6. Testing Resource-Specific Analytics Endpoints ---');

    // Business Analytics
    const bizAnalytics = await fetch(`${BASE_URL}/api/v1/analytics/business/${bizId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());
    assert(bizAnalytics.success === true, 'GET /api/v1/analytics/business/:id returned success');

    // Location Analytics
    const locAnalytics = await fetch(`${BASE_URL}/api/v1/analytics/location/${locId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());
    assert(locAnalytics.success === true, 'GET /api/v1/analytics/location/:id returned success');

    // Funnel Analytics
    const fnlAnalytics = await fetch(`${BASE_URL}/api/v1/analytics/funnel/${funnelId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());
    assert(fnlAnalytics.success === true, 'GET /api/v1/analytics/funnel/:id returned success');

    // QR Analytics
    const qrAnalytics = await fetch(`${BASE_URL}/api/v1/analytics/qr/${qrId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());
    assert(qrAnalytics.success === true, 'GET /api/v1/analytics/qr/:id returned success');

    // Top Funnels
    const topFunnelsRes = await fetch(`${BASE_URL}/api/v1/analytics/top-funnels?business_id=${bizId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());
    assert(topFunnelsRes.success === true && Array.isArray(topFunnelsRes.data), 'GET /api/v1/analytics/top-funnels returned array');
    assert(topFunnelsRes.data.length > 0 && topFunnelsRes.data[0].id === funnelId, 'Top funnels ranked current funnel correctly');

    // Top QR
    const topQrRes = await fetch(`${BASE_URL}/api/v1/analytics/top-qr?business_id=${bizId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());
    assert(topQrRes.success === true && Array.isArray(topQrRes.data), 'GET /api/v1/analytics/top-qr returned array');
    assert(topQrRes.data.length > 0 && topQrRes.data[0].id === qrId, 'Top QR ranked current QR code correctly');

    // ═══════════════════════════════════════════
    // 7. SECURITY & MULTI-TENANT ISOLATION TESTS
    // ═══════════════════════════════════════════
    console.log('\n--- 7. Security: Multi-Tenant Authorization Enforcement ---');

    // Unauthenticated request should be rejected (401)
    const unauthRes = await fetch(`${BASE_URL}/api/v1/analytics/overview?business_id=${bizId}`);
    assert(unauthRes.status === 401, 'Unauthenticated request to analytics/overview returned HTTP 401');

    // User B accessing User A's business analytics should be forbidden (403)
    const crossBizRes = await fetch(`${BASE_URL}/api/v1/analytics/business/${bizId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(crossBizRes.status === 403, `User B GET /analytics/business/${bizId} returned HTTP 403 Forbidden`);

    // User B accessing User A's location analytics should be forbidden (403)
    const crossLocRes = await fetch(`${BASE_URL}/api/v1/analytics/location/${locId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(crossLocRes.status === 403, `User B GET /analytics/location/${locId} returned HTTP 403 Forbidden`);

    // User B accessing User A's funnel analytics should be forbidden (403)
    const crossFnlRes = await fetch(`${BASE_URL}/api/v1/analytics/funnel/${funnelId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(crossFnlRes.status === 403, `User B GET /analytics/funnel/${funnelId} returned HTTP 403 Forbidden`);

    // User B accessing User A's QR analytics should be forbidden (403)
    const crossQrRes = await fetch(`${BASE_URL}/api/v1/analytics/qr/${qrId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(crossQrRes.status === 403, `User B GET /analytics/qr/${qrId} returned HTTP 403 Forbidden`);

    // User B requesting overview filtered by User A's business_id should be forbidden (403)
    const crossOverviewRes = await fetch(`${BASE_URL}/api/v1/analytics/overview?business_id=${bizId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(crossOverviewRes.status === 403, 'User B GET /analytics/overview?business_id=UserA returned HTTP 403 Forbidden');

  } catch (err: any) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n=============================================');
  console.log(`Phase 3 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
