// backend/models/weatherModel.js
const pool = require('../db');

const createWeatherEntry = async ({ location, country, latitude, longitude, real_time_weather, forecast }) => {
  const result = await pool.query(
    `INSERT INTO weather_entries (location, country, latitude, longitude, real_time_weather, forecast)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [location, country, latitude, longitude, real_time_weather, forecast]
  );
  return result.rows[0];
};

const getAllEntries = async () => {
  const result = await pool.query('SELECT * FROM weather_entries ORDER BY created_at DESC');
  return result.rows;
};

const updateEntry = async (id, fields) => {
  const keys = Object.keys(fields);
  const updates = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
  const values = keys.map(key => fields[key]);

  const result = await pool.query(
    `UPDATE weather_entries SET ${updates} WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );

  return result.rows[0];
};

const deleteEntry = async (id) => {
  await pool.query('DELETE FROM weather_entries WHERE id = $1', [id]);
};

module.exports = {
  createWeatherEntry,
  getAllEntries,
  updateEntry,
  deleteEntry
};