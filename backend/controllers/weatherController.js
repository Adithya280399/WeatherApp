// backend/controllers/weatherController.js
const weatherModel = require('../models/weatherModel');
const API_KEY = process.env.TOMORROW_API_KEY;
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const fetchRealTimeWeather = async (lat, lon) => {
  const url = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch real-time weather');
  return data;
};

const fetchForecast = async (lat, lon) => {
  const url = `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&timesteps=1d&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch forecast');
  return data;
};

exports.create = async (req, res) => {
  try {
    const { location, country, latitude, longitude } = req.body;
    if (!location || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const realTime = await fetchRealTimeWeather(latitude, longitude);
    const forecast = await fetchForecast(latitude, longitude);

    const entry = await weatherModel.createWeatherEntry({
      location,
      country,
      latitude,
      longitude,
      real_time_weather: realTime,
      forecast: forecast
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const entries = await weatherModel.getAllEntries();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, country } = req.body;

    // Update only location and country
    const updated = await weatherModel.updateEntry(id, { location, country });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await weatherModel.deleteEntry(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};