import { useState, useEffect } from "react";
import "./App.css";

// Change the weather code (a number) into text and an icon
function getWeatherInfo(code) {
  if (code === 0) return { text: "Clear sky", icon: "☀️" };
  if (code === 1 || code === 2) return { text: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { text: "Cloudy", icon: "☁️" };
  if (code === 45 || code === 48) return { text: "Foggy", icon: "🌫️" };
  if (code >= 51 && code <= 67) return { text: "Rain", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { text: "Snow", icon: "❄️" };
  if (code >= 80 && code <= 82) return { text: "Rain showers", icon: "🌦️" };
  if (code >= 85 && code <= 86) return { text: "Snow showers", icon: "🌨️" };
  if (code >= 95) return { text: "Thunderstorm", icon: "⛈️" };
  return { text: "Unknown", icon: "🌡️" };
}

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchWeather(cityName) {
    // Stop if the box is empty
    if (cityName.trim() === "") {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // 1. Find the city's location
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData.results) {
        setError("City not found. Please check the spelling.");
        return;
      }

      const place = geoData.results[0];

      // 2. Get the weather for that location
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      const current = weatherData.current;

      // 3. Change the code into text + icon
      const info = getWeatherInfo(current.weather_code);

      // 4. Save everything in state
      setWeather({
        name: place.name,
        country: place.country,
        temp: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        wind: current.wind_speed_10m,
        text: info.text,
        icon: info.icon,
      });
    } catch (err) {
      setError("Something went wrong. Please check your internet.");
    } finally {
      setLoading(false);
    }
  }

  // Show Lahore's weather when the app opens
  useEffect(() => {
    searchWeather("Lahore");
  }, []);

  return (
    <div className="app">
      <h1>Weather App</h1>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") searchWeather(city);
        }}
      />
      <button onClick={() => searchWeather(city)}>Search</button>

      {loading && <p>Loading...</p>}

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <div className="weather-icon">{weather.icon}</div>
          <h2>
            {weather.name}, {weather.country}
          </h2>
          <p className="description">{weather.text}</p>
          <p className="temp">{Math.round(weather.temp)}°C</p>
          <div className="details">
            <p>💧 Humidity: {weather.humidity}%</p>
            <p>💨 Wind: {weather.wind} km/h</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;