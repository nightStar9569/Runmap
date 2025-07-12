# How to Get Stripe Test Keys and Webhook Secrets

This guide will walk you through getting your Stripe test keys and webhook secrets step by step.

## Step 1: Create a Stripe Account

1. **Go to Stripe's website**: https://stripe.com
2. **Click "Start now"** or "Sign up"
3. **Fill in your details**:
   - Email address
   - Password
   - Business information
4. **Verify your email** when you receive the confirmation

## Step 2: Access Your Stripe Dashboard

1. **Log in** to your Stripe account
2. **You'll be redirected** to the Stripe Dashboard
3. **Note**: You'll start in **test mode** by default (this is what we want for development)

## Step 3: Get Your API Keys

### Find Your Secret Key (sk_test_...)

1. **In the left sidebar**, click on **"Developers"**
2. **Click on "API keys"**
3. **You'll see two keys**:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

4. **Copy the Secret key** - this is your `sk_test_your_stripe_secret_key`

**⚠️ Important**: 
- Never share your secret key publicly
- The secret key starts with `sk_test_` for test mode
- For production, you'll get keys starting with `sk_live_`

### Find Your Publishable Key (pk_test_...)

1. **In the same API keys section**
2. **Copy the Publishable key** - this is your `pk_test_your_stripe_publishable_key`
3. **This key is safe to use in frontend code**

## Step 4: Set Up Webhooks

### Create a Webhook Endpoint

1. **In the left sidebar**, click on **"Developers"**
2. **Click on "Webhooks"**
3. **Click "Add endpoint"**

### Configure the Webhook

1. **Endpoint URL**: Enter your webhook URL
   - For local development: `http://localhost:5000/payment/webhook`
   - For production: `https://yourdomain.com/payment/webhook`

2. **Select events to listen to**:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`

3. **Click "Add endpoint"**

### Get Your Webhook Secret (whsec_...)

1. **After creating the endpoint**, click on it
2. **Scroll down** to "Signing secret"
3. **Click "Reveal"** to see the secret
4. **Copy the webhook secret** - this is your `whsec_your_webhook_secret`

**⚠️ Important**:
- The webhook secret starts with `whsec_`
- Keep this secret secure
- You'll need this for webhook signature verification

## Step 5: Configure Your Environment Variables

### Backend (.env file)

Create a `.env` file in your `backend/` directory:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Other required variables
ACCESS_TOKEN_SECRET=your_jwt_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
```

### Frontend (.env.local file)

Create a `.env.local` file in your `frontend/` directory:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RjxW74Nxj4bqqLClaa7S6IYrq44bN5BXWHxlPnrDZrDpMa6Xh3PILPvy1UtmR5IM61V6NfTxPF02IEaeMM40CKJ00GgSYsd9Y
prod_SfMRccDD1QlpiD
```

## Step 6: Test Your Configuration

### Test Stripe Connection

```bash
cd backend
node test-payment.js
```

**Expected output**:
```
🧪 Running Payment System Tests

Testing Stripe connection...
✅ Stripe connection successful!
Account ID: acct_xxxxxxxxxxxxx
Account type: standard
✅ Payment intent created successfully!
Payment Intent ID: pi_xxxxxxxxxxxxx
Client Secret: pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx

📊 Test Results:
Stripe Connection: ✅ PASS
Webhook Setup: ✅ PASS

🎉 All tests passed! Payment system is ready.
```

### Test Webhook Locally (Optional)

1. **Install Stripe CLI**:
   ```bash
   # Windows (using Chocolatey)
   choco install stripe-cli
   
   # macOS (using Homebrew)
   brew install stripe/stripe-cli/stripe
   
   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:5000/payment/webhook
   ```

4. **Make a test payment** in your frontend
5. **Check the terminal** for webhook events

## Step 7: Test Payment Flow

### Use Test Card Numbers

1. **Successful payment**: `4242 4242 4242 4242`
2. **Declined payment**: `4000 0000 0000 0002`
3. **Requires authentication**: `4000 0025 0000 3155`

### Test Steps

1. **Start your servers**:
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend
   cd frontend && npm run dev
   ```

2. **Go to payment page**: `http://localhost:3000/payment`
3. **Enter test card details**:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
4. **Click "Pay ¥330"**
5. **Verify payment succeeds**

## Troubleshooting

### Issue: "Invalid API key"
**Solution**: 
- Check that your secret key starts with `sk_test_`
- Make sure there are no extra spaces in your `.env` file
- Verify the key is copied correctly

### Issue: "Webhook signature verification failed"
**Solution**:
- Check that your webhook secret starts with `whsec_`
- Verify the webhook endpoint URL is correct
- Make sure the webhook secret is in your `.env` file

### Issue: "Stripe not loaded" in frontend
**Solution**:
- Check that your publishable key starts with `pk_test_`
- Verify the key is in `.env.local` file
- Make sure the frontend is restarted after adding the key

### Issue: "No such file: .env"
**Solution**:
- Create the `.env` file manually in the backend directory
- Make sure the file is named exactly `.env` (not `.env.txt`)

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Keep test keys separate** from production keys
4. **Rotate keys regularly** in production
5. **Use webhook signature verification** to prevent attacks

## Production Deployment

When you're ready for production:

1. **Switch to live mode** in Stripe Dashboard
2. **Get live API keys** (start with `sk_live_` and `pk_live_`)
3. **Update environment variables** with live keys
4. **Set up production webhook** with your domain
5. **Test thoroughly** before going live

## Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Stripe CLI Documentation**: https://stripe.com/docs/stripe-cli

## Example Keys (DO NOT USE THESE - THEY ARE EXAMPLES)

```env
# Example format - replace with your actual keys
STRIPE_SECRET_KEY=sk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG
```

**Remember**: These are example formats. You need to get your own keys from your Stripe Dashboard! 