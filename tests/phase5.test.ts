// ReviewFlow AI — Phase 5 Automated Test Suite
// Tests AI Review Assistant, Reply Suggestions, Sentiment Analysis, Safety Guardrails, Quotas & Human Approval Workflow

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runPhase5Tests() {
  console.log('🧪 Starting ReviewFlow AI Phase 5 AI Assistant Test Suite...\n');
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
    // 1. SETUP USERS FOR MULTI-TENANT AUTHORIZATION TESTS
    // ═══════════════════════════════════════════
    console.log('--- 1. Setting up Tenant Users & Businesses ---');
    const userA_email = `ai_tenant_a_${Date.now()}@example.com`;
    const userB_email = `ai_tenant_b_${Date.now()}@example.com`;

    const regA = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Clinic Owner A', email: userA_email, password: 'Password@123' })
    }).then((r) => r.json());

    const tokenA = regA.data?.token;
    const userA_id = regA.data?.user?.id;
    assert(Boolean(tokenA && userA_id), 'Tenant A registered and authenticated');

    const regB = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Rival Owner B', email: userB_email, password: 'Password@123' })
    }).then((r) => r.json());

    const tokenB = regB.data?.token;
    assert(Boolean(tokenB), 'Tenant B registered and authenticated');

    // Create Business for Tenant A
    const bizA_res = await fetch(`${BASE_URL}/api/v1/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Metro Dental & Diagnostics',
        slug: `metro-dental-${Date.now()}`,
        category: 'Dental & Healthcare',
        description: 'Advanced family dentistry, dental implants and pediatric dental care.',
        address: '100 Medical Center Blvd',
        city: 'New Delhi',
        country: 'India'
      })
    }).then((r) => r.json());

    const bizA_id = bizA_res.data?.id;
    assert(Boolean(bizA_id), 'Tenant A business created');

    // Retrieve Primary Location created with business
    const locsRes = await fetch(`${BASE_URL}/api/v1/businesses/${bizA_id}/locations`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    const locA_id = locsRes.data?.[0]?.id;
    assert(Boolean(locA_id), 'Tenant A primary location resolved');

    // Connect Google Account for Tenant A in sandbox mode
    const connectA = await fetch(`${BASE_URL}/api/v1/integrations/google/connect`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(Boolean(connectA.success && connectA.data?.state), 'Google OAuth URL and state generated');

    // Complete OAuth callback
    const oauthCallbackRes = await fetch(
      `${BASE_URL}/api/v1/integrations/google/callback?code=mock_oauth_code_test&state=${encodeURIComponent(connectA.data.state)}`,
      { headers: { Accept: 'application/json' } }
    ).then((r) => r.json());

    assert(Boolean(oauthCallbackRes.success), 'Google account connected via OAuth sandbox');

    // Link location
    const linkRes = await fetch(`${BASE_URL}/api/v1/integrations/google/location-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        business_location_id: locA_id,
        google_location_id: 'locations/10001',
        google_location_name: 'Metro Dental & Diagnostics Google'
      })
    }).then((r) => r.json());

    assert(Boolean(linkRes.success), 'Google location linked to physical branch');

    // Sync reviews to populate test Google reviews for Tenant A
    await fetch(`${BASE_URL}/api/v1/google/sync-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({})
    });

    const reviewsListRes = await fetch(`${BASE_URL}/api/v1/reviews?business_id=${bizA_id}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    const reviews = reviewsListRes.data?.reviews || [];
    assert(reviews.length > 0, `Google reviews synchronized (count: ${reviews.length})`);
    const testReview = reviews[0];

    // ═══════════════════════════════════════════
    // 2. AI REVIEW ANALYSIS TESTS
    // ═══════════════════════════════════════════
    console.log('\n--- 2. Testing AI Review Analysis ---');
    const analyzeRes = await fetch(`${BASE_URL}/api/v1/ai/reviews/${testReview.id}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      }
    }).then((r) => r.json());

    assert(analyzeRes.success === true, 'Review analysis completed successfully');
    assert(
      ['positive', 'neutral', 'negative'].includes(analyzeRes.data?.sentiment),
      `Valid sentiment returned: ${analyzeRes.data?.sentiment}`
    );
    assert(
      ['low', 'medium', 'high'].includes(analyzeRes.data?.urgency),
      `Valid urgency level returned: ${analyzeRes.data?.urgency}`
    );
    assert(Array.isArray(analyzeRes.data?.topics), 'Detected topics returned as an array');
    assert(typeof analyzeRes.data?.summary === 'string', 'Factual review summary returned');

    // ═══════════════════════════════════════════
    // 3. AI REPLY SUGGESTION GENERATION (ENGLISH & HINDI, TONES)
    // ═══════════════════════════════════════════
    console.log('\n--- 3. Testing AI Reply Suggestion Generation ---');
    
    // Professional Tone in English
    const sugProfRes = await fetch(`${BASE_URL}/api/v1/ai/reviews/${testReview.id}/reply-suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ tone: 'professional', language: 'en' })
    }).then((r) => r.json());

    assert(sugProfRes.success === true, 'Professional reply suggestion generated');
    assert(sugProfRes.data?.status === 'generated', 'Suggestion status is initially "generated" (not auto-published)');
    assert(sugProfRes.data?.tone === 'professional', 'Tone recorded as professional');
    assert(Boolean(sugProfRes.data?.suggestion?.length > 10), 'Non-empty suggestion text generated');

    // Friendly Tone in Hindi
    const sugHindiRes = await fetch(`${BASE_URL}/api/v1/ai/reviews/${testReview.id}/reply-suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ tone: 'friendly', language: 'hi' })
    }).then((r) => r.json());

    assert(sugHindiRes.success === true, 'Hindi reply suggestion generated');
    assert(sugHindiRes.data?.language === 'hi', 'Language recorded as Hindi');
    assert(Boolean(sugHindiRes.data?.suggestion), 'Hindi suggestion text received');

    // Empathetic Tone
    const sugEmpRes = await fetch(`${BASE_URL}/api/v1/ai/reviews/${testReview.id}/reply-suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ tone: 'empathetic', language: 'en' })
    }).then((r) => r.json());

    assert(sugEmpRes.success === true, 'Empathetic tone suggestion generated');

    // Concise Tone
    const sugConciseRes = await fetch(`${BASE_URL}/api/v1/ai/reviews/${testReview.id}/reply-suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ tone: 'concise', language: 'en' })
    }).then((r) => r.json());

    assert(sugConciseRes.success === true, 'Concise tone suggestion generated');

    // ═══════════════════════════════════════════
    // 4. VALIDATION & SECURITY / PROMPT INJECTION DEFENSE
    // ═══════════════════════════════════════════
    console.log('\n--- 4. Testing Validation & Authorization Security ---');

    // Invalid tone rejection
    const invalidToneRes = await fetch(`${BASE_URL}/api/v1/ai/reviews/${testReview.id}/reply-suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ tone: 'aggressive_attacker' })
    });
    assert(invalidToneRes.status === 422, 'Invalid tone rejected with 422 Unprocessable Entity');

    // Invalid language rejection
    const invalidLangRes = await fetch(`${BASE_URL}/api/v1/ai/reviews/${testReview.id}/reply-suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ language: 'unsupported_klingon' })
    });
    assert(invalidLangRes.status === 422, 'Unsupported language rejected with 422');

    // Multi-tenant review ownership check (Tenant B cannot generate suggestions for Tenant A's review)
    const unauthorizedRes = await fetch(`${BASE_URL}/api/v1/ai/reviews/${testReview.id}/reply-suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify({ tone: 'friendly' })
    });
    assert(unauthorizedRes.status === 403, 'Tenant B forbidden (403) from generating suggestions for Tenant A review');

    // ═══════════════════════════════════════════
    // 5. SUGGESTIONS LIST & EDITING
    // ═══════════════════════════════════════════
    console.log('\n--- 5. Testing Suggestions History & Editing ---');
    const historyRes = await fetch(`${BASE_URL}/api/v1/ai/reviews/${testReview.id}/suggestions`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(historyRes.success === true, 'Suggestions history fetched');
    assert(Array.isArray(historyRes.data?.suggestions) && historyRes.data.suggestions.length >= 3, 'Multiple historical suggestions stored');
    assert(Boolean(historyRes.data?.analysis), 'Stored AI analysis returned in history');

    // Edit suggestion text
    const targetSuggestion = historyRes.data.suggestions[0];
    const patchRes = await fetch(`${BASE_URL}/api/v1/ai/suggestions/${targetSuggestion.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        suggestion: 'Thank you for your visit to Metro Dental! We appreciate your kind words.',
        status: 'edited'
      })
    }).then((r) => r.json());

    assert(patchRes.success === true, 'Suggestion successfully edited by business owner');
    assert(patchRes.data?.status === 'edited', 'Suggestion status transitioned to "edited"');

    // ═══════════════════════════════════════════
    // 6. HUMAN-IN-THE-LOOP EXPLICIT APPROVAL & PUBLISHING TO GOOGLE
    // ═══════════════════════════════════════════
    console.log('\n--- 6. Testing Explicit Approval & Publishing to Google API ---');
    const approveRes = await fetch(`${BASE_URL}/api/v1/ai/suggestions/${targetSuggestion.id}/approve-and-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        replyText: 'Thank you for visiting Metro Dental! Our doctors loved caring for you.'
      })
    }).then((r) => r.json());

    assert(approveRes.success === true, 'Explicit human approval published reply to Google Business Profile');
    assert(approveRes.data?.review?.has_reply === true, 'Google review record marked as replied');
    assert(Boolean(approveRes.data?.review?.google_reply_text), 'Official Google reply text recorded');

    // ═══════════════════════════════════════════
    // 7. AI USAGE CONTROLS & QUOTA
    // ═══════════════════════════════════════════
    console.log('\n--- 7. Testing AI Usage Tracking & Limits ---');
    const usageRes = await fetch(`${BASE_URL}/api/v1/ai/usage?business_id=${bizA_id}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    }).then((r) => r.json());

    assert(usageRes.success === true, 'AI usage metrics retrieved');
    assert(typeof usageRes.data?.monthlyCount === 'number' && usageRes.data.monthlyCount >= 4, `Monthly generations tracked (count: ${usageRes.data.monthlyCount})`);
    assert(typeof usageRes.data?.limit === 'number' && usageRes.data.limit > 0, `Plan limit defined: ${usageRes.data.limit}`);
    assert(typeof usageRes.data?.remaining === 'number', `Remaining quota calculated: ${usageRes.data.remaining}`);
    assert(Array.isArray(usageRes.data?.logs), 'Recent AI usage audit logs returned');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`Phase 5 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('═══════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests();
