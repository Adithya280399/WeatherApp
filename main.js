const apiKey = import.meta.env.VITE_TOMORROW_API_KEY;
const backendBaseUrl = "http://localhost:5000/api/weather";

const weatherCodeMap = {
  0: "Unknown",
  1000: "Clear ☀️",
  1100: "Mostly Clear 🌤️",
  1101: "Partly Cloudy ⛅",
  1102: "Mostly Cloudy 🌥️",
  1001: "Cloudy ☁️",
  2000: "Fog 🌫️",
  2100: "Light Fog 🌁",
  4000: "Drizzle 🌦️",
  4001: "Rain 🌧️",
  4200: "Light Rain 🌦️",
  4201: "Heavy Rain ⛈️",
  5000: "Snow 🌨️",
  5001: "Flurries ❄️",
  5100: "Light Snow 🌨️",
  5101: "Heavy Snow ❄️",
  6000: "Freezing Drizzle 🧊",
  6001: "Freezing Rain 🧊",
  6200: "Light Freezing Rain 🌧️❄️",
  6201: "Heavy Freezing Rain 🌧️❄️",
  7000: "Ice Pellets 🌨️",
  7101: "Heavy Ice Pellets ❄️",
  7102: "Light Ice Pellets ❄️",
  8000: "Thunderstorm ⛈️",
};

let lastFetched = null;

document.addEventListener("DOMContentLoaded", () => {
  loadSavedEntries();

  // // Auto-fetch current location weather
  // if (navigator.geolocation) {
  //   document.getElementById("result").textContent = "Fetching your location's weather...";
  //   navigator.geolocation.getCurrentPosition(
  //     (pos) => {
  //       const lat = pos.coords.latitude;
  //       const lon = pos.coords.longitude;
  //       fetchWeatherByCoords(lat, lon);
  //     },
  //     (err) => {
  //       console.warn("Geolocation failed:", err.message);
  //       document.getElementById("result").textContent = "Could not access your location.";
  //     }
  //   );
  // }
});

const toggleBtn = document.getElementById("toggleSaved");
const savedWrapper = document.getElementById("savedWrapper");
const toggleIcon = document.getElementById("toggleIcon");

toggleBtn?.addEventListener("click", () => {
  if (savedWrapper.classList.contains("max-h-0")) {
    savedWrapper.classList.remove("max-h-0");
    savedWrapper.classList.add("max-h-[2000px]"); // or a large enough value
    toggleIcon.style.transform = "rotate(90deg)";
  } else {
    savedWrapper.classList.add("max-h-0");
    savedWrapper.classList.remove("max-h-[2000px]");
    toggleIcon.style.transform = "rotate(0deg)";
  }
});


document.getElementById("fetchBtn").addEventListener("click", () => {
  const input = document.getElementById("locationInput").value.trim();
  if (!input) return alert("Please enter a location.");
  if (/^\d{4,6}$/.test(input)) {
    fetchByPincode(input);
  } else {
    fetchWeatherByName(input);
  }
});

document.getElementById("geoBtn")?.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      fetchWeatherByCoords(lat, lon);
    },
    (err) => {
      console.error(err);
      alert("Could not get your location.");
    }
  );
});

document.getElementById("saveBtn")?.addEventListener("click", async () => {
  if (!lastFetched) return alert("Please fetch weather before saving.");
  try {
    const res = await fetch(backendBaseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lastFetched),
    });
    const result = await res.json();
    alert("Weather saved successfully.");
    loadSavedEntries();
  } catch (err) {
    alert("Failed to save weather.");
    console.error(err);
  }
});

async function fetchByPincode(pincode) {
  const countriesToTry = ["IN", "US", "CA", "GB", "AU"]; // Add more country codes as needed
  let data = null;

  for (const country of countriesToTry) {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?postalcode=${pincode}&country=${country}&count=1`);
      const json = await res.json();
      if (json.results && json.results.length > 0) {
        data = json;
        break;
      }
    } catch (err) {
      console.warn(`Failed to fetch for country ${country}`, err);
    }
  }

  // Fallback: try using as a name (e.g., city)
  if (!data) {
    try {
      const fallbackRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${pincode}&count=1`);
      const fallbackData = await fallbackRes.json();
      if (fallbackData.results && fallbackData.results.length > 0) {
        data = fallbackData;
      }
    } catch (err) {
      console.warn("Fallback to name search failed", err);
    }
  }

  if (!data || !data.results || data.results.length === 0) {
    return alert("Could not find location for the given pincode.");
  }

  const { latitude, longitude, name, country } = data.results[0];
  fetchWeatherByCoords(latitude, longitude, name, country);
}


async function fetchWeatherByName(location) {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1`);
    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error("Location not found.");
    const { latitude, longitude, name, country } = data.results[0];
    fetchWeatherByCoords(latitude, longitude, name, country);
  } catch (err) {
    alert("Error with location: " + err.message);
  }
}

async function fetchForecast(lat, lon) {
  const res = await fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&timesteps=1d&apikey=${apiKey}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch forecast");
  return data;
}

async function fetchWeatherByCoords(lat, lon, displayName = "Your Location", country = "") {
  try {
    const res = await fetch(`https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&apikey=${apiKey}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || res.statusText);

    const conditions = data.data.values;
    document.getElementById("saveBtn").classList.remove("hidden");
    const resultBox = document.getElementById("result");
    resultBox.className = "bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg text-white w-full max-w-xl text-center mb-4";
    resultBox.innerHTML = `
      <p class="text-xl font-semibold">${displayName}${country ? `, ${country}` : ""}</p>
      <p>🌡️ Temp: ${conditions.temperature} °C</p>
      <p>💨 Wind: ${conditions.windSpeed} m/s</p>
      <p>🌧️ Precipitation: ${conditions.precipitationIntensity ?? "0"} mm/hr</p>
      <p>☁️ Cloud Cover: ${conditions.cloudCover} %</p>
    `;

    const forecastData = await fetchForecast(lat, lon);
    const days = forecastData.timelines.daily.slice(0, 5);
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    days.forEach(day => {
      const date = new Date(day.time);
      const dayString = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const { temperatureMax, temperatureMin, weatherCodeMax } = day.values;
      const code = Number(weatherCodeMax);
      const weatherText = weatherCodeMap[code] || "Unknown";
      const weatherIcon = weatherText.split(" ").pop();
      console.log("Forecast code:", code);

      forecastContainer.innerHTML += `
        <div class="bg-white text-black shadow-md rounded-lg p-4 flex flex-col items-center text-center">
          <p class="font-semibold text-lg mb-1">${dayString}</p>
          <p class="text-3xl mb-1" >${weatherText}</p>
          <div class="text-sm">
            <p>🌡️ High: ${temperatureMax}°C</p>
            <p>🌡️ Low: ${temperatureMin}°C</p>
          </div>
        </div>
      `;
    });

    lastFetched = {
      location: displayName,
      country,
      latitude: lat,
      longitude: lon
    };
    window.lastCoords = { latitude: lat, longitude: lon };
    window.lastLocationInfo = { location: displayName, country }
  } catch (err) {
    alert("Failed to fetch weather:\n" + err.message);
  }
}

async function loadSavedEntries() {
  try {
    const res = await fetch(backendBaseUrl);
    const data = await res.json();
    renderSavedEntries(data);  // 🔁 use this to include buttons
  } catch (err) {
    console.error("Failed to load saved entries:", err);
  }
}


function renderSavedEntries(entries) {
  const container = document.getElementById("savedEntries");
  container.innerHTML = "";

  entries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "entry-card bg-white text-black rounded shadow p-4 text-left";

    card.innerHTML = `
      <label class="block text-black mb-2">
        <span class="text-sm text-black font-semibold">Location:</span>
        <input class="locationInput w-full border px-2 py-1 rounded" value="${entry.location}" disabled />
      </label>
      <label class="block text-black mb-2">
        <span class="text-sm font-semibold">Country:</span>
        <input class="countryInput w-full border px-2 py-1 rounded" value="${entry.country || ''}" disabled />
      </label>
      
      <p><strong>🌡️ Temperature:</strong> ${entry.real_time_weather.data.values.temperature} °C</p>
      <p><strong>💨 Wind:</strong> ${entry.real_time_weather.data.values.windSpeed} m/s</p>
      <p><strong>☁️ Cloud Cover:</strong> ${entry.real_time_weather.data.values.cloudCover} %</p>
      <p><strong>📅 Saved At:</strong> ${new Date(entry.created_at).toLocaleString()}</p>


      <div class="mt-4 flex gap-2">
        <button class="deleteBtn bg-red-500 text-white px-3 py-1 rounded" data-id="${entry.id}">Delete</button>
        <button class="editBtn bg-yellow-500 text-white px-3 py-1 rounded" data-id="${entry.id}">Edit</button>
      </div>
    `;

    container.appendChild(card);
  });

  // DELETE HANDLER
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this entry?")) {
        await fetch(`${backendBaseUrl}/${id}`, { method: "DELETE" });
        loadSavedEntries();
      }
    });
  });

  // UPDATE HANDLER
  document.querySelectorAll(".editBtn").forEach(btn => {
  btn.addEventListener("click", async (e) => {
    const card = e.target.closest(".entry-card");
    const locationInput = card.querySelector(".locationInput");
    const countryInput = card.querySelector(".countryInput");
    const id = e.target.dataset.id;

      if (btn.textContent === "Edit") {
        locationInput.removeAttribute("disabled");
        countryInput.removeAttribute("disabled");
        locationInput.focus();
        btn.textContent = "Save";
      } else {
        const location = locationInput.value.trim();
        const country = countryInput.value.trim();

        const res = await fetch(`${backendBaseUrl}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location, country })
        });

        if (res.ok) {
          alert("Updated successfully!");
          loadSavedEntries();
        } else {
         const error = await res.json();
         alert("Update failed: " + error.error);
        }
      }
    });
  });

}


// Load saved entries on page load
window.addEventListener("DOMContentLoaded", loadSavedEntries);