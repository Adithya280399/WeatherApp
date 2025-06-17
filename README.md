#🌤️ Weather App

A modern, responsive weather application that fetches real-time weather data and forecasts using the Tomorrow.io API, with geolocation and persistent saved entries via a Node.js + PostgreSQL backend.

##🚀 Features
🌍 Search Weather by City or Pincode

📍 Use Current Location (Geolocation Support)

📊 5-Day Forecast Display

💾 Save Weather Data to Database

📝 Edit/Delete Saved Entries

🌎 Supports International Pincodes

🎨 Clean, Responsive UI (Tailwind CSS)

📦 Backend with Express.js and PostgreSQL

🗺️ Optionally Integrate Maps or Air Quality APIs

**🖼️ Demo Preview**
Coming Soon: [Live Demo Link]

**📦 Tech Stack**
Frontend	Backend	APIs	Database
HTML, JS, Tailwind CSS	Node.js, Express	Tomorrow.io, Open-Meteo	PostgreSQL

**📂 Project Structure**
pgsql
Copy
Edit
weather-app/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── main.js
│   └── style.css
├── .env
├── README.md
└── package.json

**🔧 Setup Instructions**
1. Clone the repo
bash
Copy
Edit
git clone https://github.com/your-username/weather-app.git
cd weather-app

2. Backend Setup
bash
Copy
Edit
cd backend
npm install
Set up .env with:

env
Copy
Edit
TOMORROW_API_KEY=your_tomorrow_io_key
DATABASE_URL=postgres://user:password@host:port/dbname
Run server:

bash
Copy
Edit
node server.js

3. Frontend Setup
Simply open frontend/index.html in your browser. You can use Live Server for live reload.

**🌐 API Integration**
Tomorrow.io: Real-time weather and forecast

Open-Meteo Geocoding API: City name / postal code resolution

Browser Geolocation API: Detect user's current coordinates

**✅ To-Do / Enhancements**
 Integrate Google Maps or Leaflet.js for visual location preview

 Add loading skeletons or animations

 Support exporting weather logs

 Add temperature unit toggle (°C / °F)

 Add air quality index (AQI) support

**🛠️ Developer Notes**
Ensure your PostgreSQL database is created with the correct schema

Use .env to manage API keys securely

Tailwind CSS is integrated via CDN for fast prototyping
