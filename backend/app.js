const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

sequelize.sync().then(() => {
  app.listen(5000, () => console.log('Server is running on port 5000'));
});