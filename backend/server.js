const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const coachRoutes = require('./routes/coach');
const checkinsRoutes = require('./routes/checkins');
const goalsRoutes = require('./routes/goals');
const profileRoutes = require('./routes/profile');

dotenv.config();

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

const app = express();

app.use(cors({
  origin: CLIENT_URL,
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
