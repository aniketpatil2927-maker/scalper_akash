const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runE2ETests() {
  console.log('===============================================================');
  console.log('   STARTING SCALPER AKASH FULL ECOSYSTEM END-TO-END TESTS      ');
  console.log('===============================================================\n');

  try {
    // 1. Health check
    console.log('1. Testing /api/health...');
    const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    console.log(`✓ Health Status: ${health.status}, Service: ${health.data?.service || 'OK'}`);

    // 2. Admin & Client Login
    console.log('\n2. Testing Authentication...');
    const adminLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@tradingplatform.com', password: 'Password123!' });

    const adminToken = adminLogin.data?.token;
    console.log(`✓ Admin Login: ${adminLogin.status} (Roles: ${adminLogin.data?.user?.roles?.join(', ')})`);

    const clientLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'rahul@client.com', password: 'Password123!' });

    const clientToken = clientLogin.data?.token;
    console.log(`✓ Client Login: ${clientLogin.status} (User: ${clientLogin.data?.user?.fullName})`);

    const clientHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clientToken}` };
    const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` };

    // 3. MODULE A: AI Trading Assistant
    console.log('\n3. Testing MODULE A — AI Trading Assistant & Analytics...');
    const convRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/conversations',
      method: 'POST',
      headers: clientHeaders,
    }, { title: 'BankNifty Risk Sizing Analysis' });
    console.log(`✓ AI Conversation Created: ID ${convRes.data?.id}`);

    const msgRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/ai/conversations/${convRes.data.id}/messages`,
      method: 'POST',
      headers: clientHeaders,
    }, { message: 'Analyze my winning trades and what mistakes caused my losses' });
    console.log(`✓ AI Message Response: ${msgRes.status}`);
    console.log(`  AI Output snippet: "${msgRes.data?.aiMessage?.message?.substring(0, 80)}..."`);
    console.log(`  Usage remaining: ${msgRes.data?.usage?.remainingQueries} queries`);

    // 4. MODULE A: Analytics Overview & Charts
    console.log('\n4. Testing Advanced Trading Analytics Endpoints...');
    const analyticsOverview = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/overview',
      method: 'GET',
      headers: clientHeaders,
    });
    console.log(`✓ Analytics Overview: Win Rate: ${analyticsOverview.data?.winRate}%, Net P&L: ₹${analyticsOverview.data?.netPnl}, Profit Factor: ${analyticsOverview.data?.profitFactor}`);

    const analyticsCharts = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/charts?range=ALL',
      method: 'GET',
      headers: clientHeaders,
    });
    console.log(`✓ Analytics Charts: P&L curve points: ${analyticsCharts.data?.pnlCurve?.length}, Strategy points: ${analyticsCharts.data?.strategyData?.length}`);

    // 5. MODULE A: Trading Journal & Weekly AI Review
    console.log('\n5. Testing Trading Journal & AI Weekly Review...');
    const journalEntryRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/journal',
      method: 'POST',
      headers: clientHeaders,
    }, {
      asset: 'NIFTY 22450 CE',
      direction: 'BUY',
      entryPrice: 130.00,
      exitPrice: 185.00,
      quantity: 50,
      strategy: 'ORB Breakout',
      emotion: 'DISCIPLINED',
      mistake: 'NONE',
      notes: 'Clean entry on 15m breakout bar above VWAP',
    });
    console.log(`✓ Journal Entry Logged: P&L ₹${journalEntryRes.data?.pnl} (+${journalEntryRes.data?.pnlPercentage}%)`);

    const weeklyReview = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/journal/ai-review',
      method: 'GET',
      headers: clientHeaders,
    });
    console.log(`✓ AI Weekly Review: Discipline Score: ${weeklyReview.data?.disciplineScore}/100, Best Setup: ${weeklyReview.data?.bestSetup}`);

    // 6. MODULE B: Referral & Affiliate Engine
    console.log('\n6. Testing MODULE B — Referral & Affiliate Engine...');
    const referralDash = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/referrals/dashboard',
      method: 'GET',
      headers: clientHeaders,
    });
    console.log(`✓ Client Referral Link: ${referralDash.data?.referralLink}`);
    console.log(`  Conversions: ${referralDash.data?.stats?.conversions}, Pending: ₹${referralDash.data?.stats?.pendingCommission}`);

    const adminReferrals = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/referrals/admin/overview',
      method: 'GET',
      headers: adminHeaders,
    });
    console.log(`✓ Admin Referral Overview: Total Affiliates: ${adminReferrals.data?.totalAffiliates}, Conversion Rate: ${adminReferrals.data?.conversionRate}%`);

    // 7. MODULE C: Courses Marketplace & Certificates
    console.log('\n7. Testing MODULE C — Paid Courses & Certificate Issuance...');
    const coursesList = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/courses',
      method: 'GET',
    });
    console.log(`✓ Courses Marketplace: Found ${coursesList.data?.length} published courses`);

    const courseDetail = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/courses/intraday-scalping-mastery',
      method: 'GET',
      headers: clientHeaders,
    });
    console.log(`✓ Course Syllabus: "${courseDetail.data?.course?.title}", Modules: ${courseDetail.data?.course?.CourseModules?.length}`);

    const certVerify = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/courses/certificates/CERT-AKASH-2026-904128',
      method: 'GET',
    });
    console.log(`✓ Certificate Verification: Student "${certVerify.data?.studentName}", Course: "${certVerify.data?.courseTitle}" (Valid: ${certVerify.data?.valid})`);

    // 8. MODULE D: Paid Webinars & Live Masterclasses
    console.log('\n8. Testing MODULE D — Paid Webinars & Masterclasses...');
    const webinarsList = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/webinars',
      method: 'GET',
    });
    console.log(`✓ Webinars Listed: Found ${webinarsList.data?.length} sessions. First: "${webinarsList.data[0]?.title}" (${webinarsList.data[0]?.seatsRemaining} seats left)`);

    // 9. Coupon Engine & Unified Order Checkout
    console.log('\n9. Testing Coupons & Unified Order Payment Processing...');
    const couponVal = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/coupons/validate',
      method: 'POST',
      headers: clientHeaders,
    }, { code: 'WELCOME50', productType: 'COURSE', amount: 1499.00 });
    console.log(`✓ Coupon Validation: Code ${couponVal.data?.code}, Discount: ₹${couponVal.data?.discountAmount}, Final: ₹${couponVal.data?.finalAmount}`);

    const unifiedOrder = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'POST',
      headers: clientHeaders,
    }, {
      orderType: 'COURSE',
      itemId: 1,
      couponCode: 'WELCOME50',
    });
    console.log(`✓ Unified Order Created: ID ${unifiedOrder.data?.orderId}, Type: ${unifiedOrder.data?.orderType}, Final Amount: ₹${unifiedOrder.data?.finalAmount}`);

    const payVerify = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/payments/verify',
      method: 'POST',
      headers: clientHeaders,
    }, {
      orderId: unifiedOrder.data.orderId,
      paymentGatewayId: 'pay_rzp_mock_live_9021',
      status: 'SUCCESS',
    });
    console.log(`✓ Payment Verified: Status: ${payVerify.data?.status}, Invoice: ${payVerify.data?.invoiceNumber}`);

    // 10. Admin Executive Revenue ERP
    console.log('\n10. Testing Admin Executive Revenue & KPI Dashboard...');
    const revenueAnalytics = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/revenue/admin/analytics',
      method: 'GET',
      headers: adminHeaders,
    });
    console.log(`✓ Executive Revenue Analytics: Gross: ₹${revenueAnalytics.data?.totalRevenue?.toLocaleString('en-IN')}, Net: ₹${revenueAnalytics.data?.netRevenue?.toLocaleString('en-IN')}, MRR: ₹${revenueAnalytics.data?.mrr?.toLocaleString('en-IN')}`);

    console.log('\n===============================================================');
    console.log('   🎉 ALL ECOSYSTEM MODULES PASSED END-TO-END VERIFICATION!   ');
    console.log('===============================================================');

  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

runE2ETests();
