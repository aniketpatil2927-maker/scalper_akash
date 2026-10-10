/**
 * Walkthrough Integration Test Script
 * Verifies the complete customer journey, payment checkout, database transactions,
 * and the Two-Trade Allocation Engine logic.
 */
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const API_PORT = 5001; // Separate port for testing
const API_URL = `http://127.0.0.1:${API_PORT}/api`;

let serverProcess = null;

// Helper to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function startServer() {
  console.log(`Starting mock server on port ${API_PORT}...`);
  
  // Set env vars override for testing
  const env = { 
    ...process.env, 
    PORT: API_PORT, 
    NODE_ENV: 'test',
    JWT_SECRET: 'test_jwt_secret_key_123_abc',
    ALLOW_MULTIPLE_ACTIVE_PLANS: 'true'
  };

  serverProcess = spawn('node', ['dist/index.js'], {
    cwd: path.join(__dirname, '..'),
    env
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Server] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data.toString().trim()}`);
  });

  // Allow server boot
  await delay(8000);
  console.log('Server process started.');
}

async function executeTest() {
  try {
    console.log('--- Initializing Walkthrough Integration Test ---');

    // 1. User Registration
    console.log('\n[Step 1] Registering a new client...');
    const registerUserRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'John Doe',
        mobile: '9876543210',
        email: `john.doe.${Date.now()}@example.com`,
        password: 'password123'
      })
    });
    const userRegData = await registerUserRes.json();
    if (!registerUserRes.ok) throw new Error(userRegData.error);
    const clientEmail = userRegData.email;
    const otpMock = userRegData.otpMock;
    console.log(`✓ Client registration succeeded. Email: ${clientEmail}, OTP Received: ${otpMock}`);

    // 2. OTP Verification
    console.log('\n[Step 2] Verifying OTP...');
    const verifyUserRes = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clientEmail, otp: otpMock })
    });
    const verifyData = await verifyUserRes.json();
    if (!verifyUserRes.ok) throw new Error(verifyData.error);
    console.log(`✓ OTP Verification completed: ${verifyData.message}`);

    // 3. User Login
    console.log('\n[Step 3] Logging in as client...');
    const loginUserRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clientEmail, password: 'password123' })
    });
    const loginUserData = await loginUserRes.json();
    if (!loginUserRes.ok) throw new Error(loginUserData.error);
    const clientToken = loginUserData.token;
    console.log(`✓ Login successful. JWT Token acquired.`);

    // 4. Register & Login a Trader (For publishing signals)
    console.log('\n[Step 4] Setting up Trader credentials...');
    const traderEmail = `trader.${Date.now()}@traderpro.com`;
    const registerTraderRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Vikram Trader',
        mobile: '8888888888',
        email: traderEmail,
        password: 'traderpassword123'
      })
    });
    const traderRegData = await registerTraderRes.json();
    
    // Verify OTP for Trader
    await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: traderEmail, otp: traderRegData.otpMock })
    });

    // Elevate registered user to TRADER role directly in database
    const { User: UserModel, Role: RoleModel } = require('../dist/models/index.js');
    const dbUser = await UserModel.findOne({ where: { email: traderEmail } });
    const traderRole = await RoleModel.findOne({ where: { name: 'TRADER' } });
    await dbUser.addRole(traderRole);

    // Login Trader
    const loginTraderRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: traderEmail, password: 'traderpassword123' })
    });
    const loginTraderData = await loginTraderRes.json();
    const traderToken = loginTraderData.token;
    
    // In our seed script, role 3 is TRADER. Let's assume the server DB handles permission roles.
    // (In local testing, since we can access sequelize models in this node script, we can enforce
    // trader permissions. Or we can just log in as trader).
    console.log(`✓ Trader setup complete. JWT Token acquired.`);

    // 5. Checkout & Payment Simulation
    console.log('\n[Step 5] Selecting Plan & Simulating Payment Checkout...');
    // Create checkout order for Premium Plan (planId = 2)
    const createOrderRes = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({ planId: 2 })
    });
    const orderData = await createOrderRes.json();
    if (!createOrderRes.ok) throw new Error(orderData.error);
    console.log(`✓ Order Created. Order ID: ${orderData.orderId}, Amount: ₹${orderData.amount}`);

    // Verify Payment (Simulate success)
    const verifyPayRes = await fetch(`${API_URL}/payments/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        orderId: orderData.orderId,
        paymentGatewayId: 'pay_verify_mock_9988',
        status: 'SUCCESS'
      })
    });
    const payVerifyData = await verifyPayRes.json();
    if (!verifyPayRes.ok) throw new Error(payVerifyData.error);
    console.log(`✓ Payment Server-side Verified. Invoice Generated: ${payVerifyData.invoiceNumber}`);
    console.log(`✓ Subscription Activated. Allocated Trade Credits: ${payVerifyData.subscription.remainingTrades}`);

    // 6. Trader Authors & Publishes Signal 1
    console.log('\n[Step 6] Trader publishing Trade Setup 1 (Premium)...');
    
    // Need to bypass local route checks or use SQL. Since Sequelize models can be accessed directly,
    // let's verify if the API supports it. In our controller, publishTrade assigns signals.
    // Since our test database is SQLite/MySQL, let's create a trade signal.
    // Create Trade Draft
    const createTradeRes = await fetch(`${API_URL}/trader/trades`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${traderToken}` // Trader authorization header
      },
      body: JSON.stringify({
        asset: 'ETH/USDT',
        direction: 'BUY',
        entryPrice: 3400.00,
        stopLoss: 3300.00,
        target1: 3600.00,
        riskLevel: 'MEDIUM',
        accessTier: 'PREMIUM',
        analysis: 'ETH double bottom breakout'
      })
    });
    const trade1Data = await createTradeRes.json();
    if (!createTradeRes.ok) throw new Error(trade1Data.error);
    console.log(`✓ Trade 1 Draft Saved. ID: ${trade1Data.id}`);

    // Publish Trade 1
    const publish1Res = await fetch(`${API_URL}/trader/trades/${trade1Data.id}/publish`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${traderToken}`
      }
    });
    const publish1Data = await publish1Res.json();
    if (!publish1Res.ok) throw new Error(publish1Data.error);
    console.log(`✓ Trade 1 Published. Allocated to: ${publish1Data.allocatedCount} subscribers.`);

    // 7. Check Client's dashboard for Trade 1 & Credits Decremented
    console.log('\n[Step 7] Reading Client Dashboard after Trade 1...');
    const clientProfile1Res = await fetch(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    const clientProfile1 = await clientProfile1Res.json();
    const remainingCredits1 = clientProfile1.Subscriptions[0].remainingTrades;
    console.log(`✓ Remaining trade credits check: ${remainingCredits1} (Expected: 1)`);
    if (remainingCredits1 !== 1) throw new Error('Credits did not decrement correctly on Trade 1 allocation!');

    // 8. Trader Authors & Publishes Signal 2
    console.log('\n[Step 8] Trader publishing Trade Setup 2...');
    const createTrade2Res = await fetch(`${API_URL}/trader/trades`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${traderToken}`
      },
      body: JSON.stringify({
        asset: 'SOL/USDT',
        direction: 'BUY',
        entryPrice: 140.00,
        stopLoss: 130.00,
        target1: 160.00,
        riskLevel: 'HIGH',
        accessTier: 'PREMIUM',
        analysis: 'SOL bullish consolidation'
      })
    });
    const trade2Data = await createTrade2Res.json();
    
    const publish2Res = await fetch(`${API_URL}/trader/trades/${trade2Data.id}/publish`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${traderToken}`
      }
    });
    const publish2Data = await publish2Res.json();
    console.log(`✓ Trade 2 Published. Allocated to: ${publish2Data.allocatedCount} subscribers.`);

    // Check remaining credits
    const clientProfile2Res = await fetch(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    const clientProfile2 = await clientProfile2Res.json();
    const remainingCredits2 = clientProfile2.Subscriptions[0].remainingTrades;
    console.log(`✓ Remaining trade credits check: ${remainingCredits2} (Expected: 0)`);
    if (remainingCredits2 !== 0) throw new Error('Credits did not decrement correctly on Trade 2 allocation!');

    // 9. Trader Authors & Publishes Signal 3 (User should NOT receive it since credits = 0)
    console.log('\n[Step 9] Trader publishing Trade Setup 3 (Subscribers should not receive it)...');
    const createTrade3Res = await fetch(`${API_URL}/trader/trades`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${traderToken}`
      },
      body: JSON.stringify({
        asset: 'BTC/USDT',
        direction: 'BUY',
        entryPrice: 65000.00,
        stopLoss: 63000.00,
        target1: 70000.00,
        riskLevel: 'LOW',
        accessTier: 'PREMIUM',
        analysis: 'BTC breakout flag'
      })
    });
    const trade3Data = await createTrade3Res.json();
    
    const publish3Res = await fetch(`${API_URL}/trader/trades/${trade3Data.id}/publish`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${traderToken}`
      }
    });
    const publish3Data = await publish3Res.json();
    console.log(`✓ Trade 3 Published. Allocated to: ${publish3Data.allocatedCount} subscribers.`);
    
    // Client should have 0 trades allocated for Trade 3
    const getClientTradesRes = await fetch(`${API_URL}/trades`, {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    const clientTrades = await getClientTradesRes.json();
    console.log(`✓ Client's Allocated Trades total: ${clientTrades.length} (Expected: 2)`);
    
    const hasTrade3 = clientTrades.some(t => t.id === trade3Data.id);
    console.log(`✓ Was Trade 3 allocated to Client? ${hasTrade3 ? 'YES (Error)' : 'NO (Correct)'}`);
    if (hasTrade3) throw new Error('Rule Violation: User received more trades than allowed by their plan!');

    console.log('\n======================================================');
    console.log('  INTEGRATION WALKTHROUGH TEST COMPLETED SUCCESSFULLY!  ');
    console.log('  All Two-Trade business rules verified on the server.  ');
    console.log('======================================================');

  } catch (err) {
    console.error('\n❌ WALKTHROUGH TEST FAILED:', err);
  } finally {
    if (serverProcess) {
      console.log('Shutting down testing server...');
      serverProcess.kill();
    }
  }
}

// Build and launch
console.log('Compiling TypeScript backend...');
runCommand('npm run build', path.join(__dirname, '..'))
  .then(() => {
    console.log('TypeScript build finished.');
    return startServer();
  })
  .then(() => {
    return executeTest();
  })
  .catch(err => {
    console.error('Build/Startup failure:', err);
  });
