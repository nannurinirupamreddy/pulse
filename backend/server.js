const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const coachRoutes = require('./routes/coach');
const checkinsRoutes = require('./routes/checkins');
const goalsRoutes = require('./routes/goals');
const profileRoutes = require('./routes/profile');

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/api/checkins', checkinsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/coach', coachRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});