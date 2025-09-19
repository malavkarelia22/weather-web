// Your OpenWeatherMap API key
const apiKey = "135583f95b5caeaf30ea97a624841b12";
let isCelsius = true;
let currentTimezoneOffset = 0; // store timezone of current city
let timerId = null; // store interval ID

// Toggle temperature unit
document.getElementById("toggleUnit").addEventListener("click", () => {
  isCelsius = !isCelsius;
  const city = document.getElementById("cityInput").value.trim();
  if(city) getWeather();
});

// Fetch weather data
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name!");
    return;
  }

  const units = isCelsius ? "metric" : "imperial";
  const tempUnit = isCelsius ? "°C" : "°F";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();

    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Convert sunrise/sunset from UNIX timestamp
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

    // Save timezone for local time updates
    currentTimezoneOffset = data.timezone;

    // Display weather info
    document.getElementById("result").innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <img src="${iconUrl}" alt="Weather icon">
      <p>🌡 Temp: ${data.main.temp} ${tempUnit} | Feels like: ${data.main.feels_like} ${tempUnit}</p>
      <p>☁ Weather: ${data.weather[0].description}</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>🌬 Wind Speed: ${data.wind.speed} ${isCelsius ? "m/s" : "mph"}</p>
      <p>🌅 Sunrise: ${sunrise} | Sunset: ${sunset}</p>
    `;

    // Start or update local time display
    startLocalTime();

  } catch (error) {
    document.getElementById("result").innerHTML = `<p style="color: red;">❌ ${error.message}</p>`;
  }
}

// Display local time dynamically (single interval)
function startLocalTime() {
  function updateTime() {
    const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
    const localTime = new Date(nowUTC.getTime() + currentTimezoneOffset * 1000);
    document.getElementById("timeDate").textContent = `🕒 Local Time: ${localTime.toLocaleString()}`;
    setTimeBasedBackground(localTime);
  }

  // Clear existing interval to avoid multiple timers
  if(timerId) clearInterval(timerId);
  updateTime();
  timerId = setInterval(updateTime, 1000);
}

// Set background based on local time
function setTimeBasedBackground(localTime) {
  const hour = localTime.getHours();
  let bgUrl = "";

  if (hour >= 6 && hour < 12) {
    // Morning
    bgUrl = "https://images.unsplash.com/photo-1526066843114-f1623fde3476?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  } else if (hour >= 12 && hour < 18) {
    // Evening
    bgUrl = "https://plus.unsplash.com/premium_photo-1672319360970-3de261cea881?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  } else {
    // Night
    bgUrl = "https://images.unsplash.com/photo-1595520519880-a86c48ea536c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  }

  document.body.style.background = `url(${bgUrl}) no-repeat center center fixed`;
  document.body.style.backgroundSize = "cover";
}
