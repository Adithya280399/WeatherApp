// backend/server.js
const express = require('express');
const app = express();
const cors = require('cors');
const weatherRoutes = require('./routes/weather');
require('dotenv').config({ path: '../.env' });

app.use(cors());
app.use(express.json());
app.use('/api/weather', weatherRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));