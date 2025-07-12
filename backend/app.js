const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
require('./cron/reminder');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Raw body middleware for Stripe webhooks
app.use('/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/payment', paymentRoutes);

sequelize.sync().then(() => {
  app.listen(5000, () => console.log('Server is running on port 5000'));
});