# Payment System Setup Guide

This guide will help you set up the Stripe payment system for the Runmap application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js and npm installed
3. MySQL database running

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=Runmap_db_development

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Stripe Configuration

1. Go to your Stripe Dashboard
2. Get your **Publishable Key** and **Secret Key** from the Developers > API keys section
3. Replace `sk_test_your_stripe_secret_key_here` with your actual secret key

### 4. Webhook Setup

1. In your Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `http://your-domain.com/payment/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret and add it to your `.env` file

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 3. Update Stripe Publishable Key

Replace `pk_test_your_stripe_publishable_key_here` with your actual publishable key from Stripe.

## Database Setup

### 1. Run Migrations

```bash
cd backend
npx sequelize-cli db:migrate
```

### 2. Verify User Model

Make sure your User model has the `membershipStatus` field. If not, create a migration:

```bash
npx sequelize-cli migration:generate --name add-membership-status
```

Add this to the migration:

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'membershipStatus', {
      type: Sequelize.STRING,
      defaultValue: 'free',
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'membershipStatus');
  }
};
```

## Testing the Payment System

### 1. Start the Backend

```bash
cd backend
npm start
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Payment Flow

1. Register a new account or log in
2. Navigate to `/payment`
3. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Requires Authentication**: `4000 0025 0000 3155`

**Note**: Premium membership costs ¥330 per year.

## Features Implemented

### Backend Features
- ✅ Stripe payment intent creation
- ✅ Payment confirmation
- ✅ Webhook handling for payment events
- ✅ User membership status updates
- ✅ Payment method management
- ✅ Pricing information API

### Frontend Features
- ✅ Modern payment form with Stripe Elements
- ✅ Real-time payment processing
- ✅ Error handling and validation
- ✅ Success/failure notifications
- ✅ Responsive design
- ✅ Security indicators

### Security Features
- ✅ Stripe webhook signature verification
- ✅ Payment intent validation
- ✅ User authentication required
- ✅ Secure card data handling (no card data stored)
- ✅ Environment variable protection

## API Endpoints

### Payment Endpoints
- `POST /payment/create-payment-intent` - Create payment intent
- `POST /payment/confirm-payment` - Confirm payment
- `GET /payment/payment-methods` - Get user payment methods
- `GET /payment/pricing` - Get pricing information
- `POST /payment/webhook` - Stripe webhook handler

### User Endpoints
- `GET /user/profile` - Get user profile
- `PUT /user/profile/update` - Update user profile
- `PUT /user/notifications/toggle` - Toggle notifications

## Troubleshooting

### Common Issues

1. **Payment fails with "Invalid API key"**
   - Check your Stripe secret key in the backend `.env` file
   - Make sure you're using the correct test/live keys

2. **Webhook not receiving events**
   - Verify webhook endpoint URL is correct
   - Check webhook secret in `.env` file
   - Ensure webhook events are selected in Stripe dashboard

3. **Frontend shows "Stripe not loaded"**
   - Check your publishable key in frontend `.env.local`
   - Make sure the key starts with `pk_test_` or `pk_live_`

4. **Database connection errors**
   - Verify MySQL is running
   - Check database credentials in `.env` file
   - Run migrations if needed

### Support

For Stripe-specific issues, refer to the [Stripe Documentation](https://stripe.com/docs).

For application-specific issues, check the console logs in both frontend and backend. 