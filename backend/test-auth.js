const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testAuthAndPayment() {
  try {
    console.log('🧪 Testing Authentication and Payment Flow\n');

    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ User registered successfully');

    // Step 2: Login to get token
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const { accessToken } = loginResponse.data;
    console.log('✅ Login successful, got access token');

    // Step 3: Test pricing endpoint (no auth required)
    console.log('\n3. Testing pricing endpoint...');
    const pricingResponse = await axios.get(`${API_BASE}/payment/pricing`);
    console.log('✅ Pricing data:', pricingResponse.data);

    // Step 4: Test payment intent creation (requires auth)
    console.log('\n4. Testing payment intent creation...');
    const paymentIntentResponse = await axios.post(
      `${API_BASE}/payment/create-payment-intent`,
      {
        amount: 330,
        currency: 'jpy'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    console.log('✅ Payment intent created successfully');
    console.log('Payment Intent ID:', paymentIntentResponse.data.paymentIntentId);

    // Step 5: Test user profile (requires auth)
    console.log('\n5. Testing user profile...');
    const profileResponse = await axios.get(`${API_BASE}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ User profile retrieved');
    console.log('Membership Status:', profileResponse.data.membershipStatus);

    console.log('\n🎉 All tests passed! Authentication and payment system is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Go to http://localhost:3000');
    console.log('2. Login with test@example.com / password123');
    console.log('3. Navigate to /payment');
    console.log('4. Test the payment with card: 4242 4242 4242 4242');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 409) {
      console.log('\nUser already exists, trying login instead...');
      try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: 'test@example.com',
          password: 'password123'
        });
        console.log('✅ Login successful with existing user');
        console.log('Access Token:', loginResponse.data.accessToken);
      } catch (loginError) {
        console.error('❌ Login failed:', loginError.response?.data || loginError.message);
      }
    }
  }
}

// Run the test
testAuthAndPayment(); 