# Payment Function Testing Guide

This guide will help you test whether the payment function is working correctly.

## Prerequisites

Before testing, ensure you have:

1. ✅ Backend server running on port 5000
2. ✅ Frontend server running on port 3000
3. ✅ MySQL database running
4. ✅ Stripe API keys configured in environment variables
5. ✅ All dependencies installed

## Step 1: Environment Setup

### Backend Environment Variables
Create `.env` file in `backend/` directory:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
ACCESS_TOKEN_SECRET=your_jwt_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
```

### Frontend Environment Variables
Create `.env.local` file in `frontend/` directory:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Step 2: Backend Testing

### Test Stripe Connection
```bash
cd backend
node test-payment.js
```

**Expected Output:**
```
🧪 Running Payment System Tests

Testing Stripe connection...
✅ Stripe connection successful!
Account ID: acct_xxxxxxxxxxxxx
Account type: standard
✅ Payment intent created successfully!
Payment Intent ID: pi_xxxxxxxxxxxxx
Client Secret: pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx

Testing webhook signature verification...
✅ Webhook signature verification would work with proper secret

📊 Test Results:
Stripe Connection: ✅ PASS
Webhook Setup: ✅ PASS

🎉 All tests passed! Payment system is ready.
```

### Test API Endpoints
Use Postman or curl to test these endpoints:

#### 1. Get Pricing Information
```bash
curl http://localhost:5000/payment/pricing
```

**Expected Response:**
```json
{
  "premium": {
    "name": "Premium Membership",
    "price": 330,
    "currency": "jpy",
    "features": [
      "Email notifications for event reminders",
      "Priority support",
      "Advanced event filtering",
      "Unlimited favorites"
    ],
    "duration": "yearly"
  }
}
```

#### 2. Create Payment Intent (requires authentication)
```bash
# First, get a JWT token by logging in
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Then create payment intent
curl -X POST http://localhost:5000/payment/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount":330,"currency":"jpy"}'
```

**Expected Response:**
```json
{
  "clientSecret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx",
  "paymentIntentId": "pi_xxxxxxxxxxxxx"
}
```

## Step 3: Frontend Testing

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. User Registration/Login
1. Open browser and go to `http://localhost:3000`
2. Click "Register" or "Login"
3. Create a test account or login with existing credentials
4. Verify you're logged in (check for user menu)

### 3. Navigate to Payment Page
1. Go to `http://localhost:3000/payment`
2. Verify the page loads correctly
3. Check that pricing shows ¥330 per year
4. Verify the payment form is displayed

### 4. Test Payment Flow

#### Test Case 1: Successful Payment
1. **Use test card**: `4242 4242 4242 4242`
2. **Expiry**: Any future date (e.g., 12/25)
3. **CVC**: Any 3 digits (e.g., 123)
4. **Click "Pay ¥330"**
5. **Expected Result**: Payment succeeds, membership upgraded to "Premium"

#### Test Case 2: Declined Payment
1. **Use test card**: `4000 0000 0000 0002`
2. **Expiry**: Any future date
3. **CVC**: Any 3 digits
4. **Click "Pay ¥330"**
5. **Expected Result**: Payment fails with error message

#### Test Case 3: Authentication Required
1. **Use test card**: `4000 0025 0000 3155`
2. **Expiry**: Any future date
3. **CVC**: Any 3 digits
4. **Click "Pay ¥330"**
5. **Expected Result**: 3D Secure authentication popup

## Step 4: Database Verification

### Check User Membership Status
```sql
-- Connect to your MySQL database
USE Runmap_db_development;

-- Check user membership status
SELECT id, username, email, membershipStatus, notificationEnabled 
FROM Users 
WHERE email = 'test@example.com';
```

**Expected Result after successful payment:**
```
+----+----------+------------------+------------------+---------------------+
| id | username | email            | membershipStatus | notificationEnabled |
+----+----------+------------------+------------------+---------------------+
|  1 | testuser | test@example.com | paid             |                   1 |
+----+----------+------------------+------------------+---------------------+
```

## Step 5: Webhook Testing

### Test Webhook Locally
1. **Install Stripe CLI** (for local webhook testing)
2. **Forward webhooks to local server**:
```bash
stripe listen --forward-to localhost:5000/payment/webhook
```

3. **Make a test payment** in the frontend
4. **Check webhook logs** in the terminal

**Expected Output:**
```
2023-07-12 10:30:00   --> payment_intent.succeeded [evt_xxxxxxxxxxxxx]
2023-07-12 10:30:00  <--  [200] POST http://localhost:5000/payment/webhook [evt_xxxxxxxxxxxxx]
```

## Step 6: Notification Testing

### Test Email Notifications
1. **Upgrade to premium membership**
2. **Add an event to favorites**
3. **Wait for cron job** (or trigger manually)
4. **Check email** for notification

### Test In-App Notifications
```sql
-- Check notifications in database
SELECT * FROM Notifications WHERE userId = 1;
```

## Step 7: Error Handling Testing

### Test Invalid API Key
1. **Change Stripe secret key** to invalid value
2. **Try to make payment**
3. **Expected Result**: Error message about invalid API key

### Test Network Errors
1. **Disconnect internet**
2. **Try to make payment**
3. **Expected Result**: Network error message

### Test Invalid Card Data
1. **Enter invalid card number** (e.g., 1234 5678 9012 3456)
2. **Try to make payment**
3. **Expected Result**: Card validation error

## Step 8: Security Testing

### Test Authentication
1. **Try to access payment page without login**
2. **Expected Result**: Redirected to login page

### Test Payment Intent Validation
1. **Try to confirm payment with wrong payment intent ID**
2. **Expected Result**: Error about invalid payment intent

## Troubleshooting Common Issues

### Issue 1: "Stripe not loaded"
**Solution**: Check frontend environment variables and Stripe publishable key

### Issue 2: "Invalid API key"
**Solution**: Verify Stripe secret key in backend `.env` file

### Issue 3: "Payment intent not found"
**Solution**: Check payment intent creation and confirmation flow

### Issue 4: "Webhook signature verification failed"
**Solution**: Verify webhook secret in environment variables

### Issue 5: "Database connection error"
**Solution**: Check MySQL connection and credentials

## Test Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Stripe connection test passes
- [ ] Pricing API returns correct data
- [ ] User can register/login
- [ ] Payment page loads correctly
- [ ] Successful payment upgrades membership
- [ ] Failed payment shows error message
- [ ] Database reflects membership changes
- [ ] Webhooks are received (if configured)
- [ ] Error handling works correctly
- [ ] Security measures are enforced

## Performance Testing

### Load Testing
```bash
# Test multiple concurrent payments
ab -n 100 -c 10 -p payment_data.json -T application/json http://localhost:5000/payment/create-payment-intent
```

### Response Time Testing
- Payment intent creation: < 2 seconds
- Payment confirmation: < 3 seconds
- Page load time: < 3 seconds

## Success Criteria

The payment function is working correctly if:

1. ✅ **Payment intent creation** succeeds
2. ✅ **Payment confirmation** works with valid cards
3. ✅ **Membership status** updates in database
4. ✅ **Error handling** works for invalid cards
5. ✅ **Security measures** prevent unauthorized access
6. ✅ **Webhooks** process payment events (if configured)
7. ✅ **User experience** is smooth and intuitive

If all these criteria are met, your payment function is working correctly! 