const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const cityName = document.getElementById("cityName");

const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const weatherDescription = document.getElementById("weatherDescription");
const date = document.getElementById("date");

searchBtn.addEventListener("click", searchCity);

async function searchCity() {

    const city = cityInput.value.trim();

    if (city === "") {
        cityName.textContent = "Please enter a city name";
        return;
    }

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    cityName.textContent = "Getting weather information...";

    try {

        // STEP 1: Find the city
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json&countryCode=NG`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            cityName.textContent = "City not found";
            return;
        }

        const location = data.results[0];

        cityName.textContent =
            `${location.name}, ${location.country}`;

        // STEP 2: Get the weather
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to retrieve weather data");
        }

        const weatherData = await weatherResponse.json();

        console.log(weatherData);

        // STEP 3: Display weather information
        const current = weatherData.current;

        // Change background based on weather
        const weatherCode = current.weather_code;

        document.body.classList.remove(
            "sunny",
            "cloudy",
            "rainy",
            "snowy",
            "foggy",
            "stormy"
        );

        if (weatherCode === 0 || weatherCode === 1) {
            document.body.classList.add("sunny");

        } else if (weatherCode === 2 || weatherCode === 3) {
            document.body.classList.add("cloudy");

        } else if (weatherCode >= 51 && weatherCode <= 82) {
            document.body.classList.add("rainy");

        } else if (weatherCode >= 71 && weatherCode <= 77) {
            document.body.classList.add("snowy");

        } else if (weatherCode === 45 || weatherCode === 48) {
            document.body.classList.add("foggy");

        } else if (weatherCode >= 95) {
            document.body.classList.add("stormy");
        }

        // Display the next 6 hours
        const hourly = weatherData.hourly;
        const hourlyContainer = document.getElementById("hourlyContainer");

        hourlyContainer.innerHTML = "";

        const currentTime = current.time;

        const startIndex = hourly.time.findIndex(time => time >= currentTime);

        for (let i = startIndex; i < startIndex + 6; i++) {

            if (i >= hourly.time.length) {
                break;
            }

            const hour = new Date(hourly.time[i]).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            });

            const card = document.createElement("div");

            card.classList.add("hourly-card");

            const hourlyWeatherCodes = {
                0: "☀️",
                1: "🌤️",
                2: "⛅",
                3: "☁️",
                45: "🌫️",
                48: "🌫️",
                51: "🌦️",
                53: "🌧️",
                55: "🌧️",
                61: "🌧️",
                63: "🌧️",
                65: "🌧️",
                71: "🌨️",
                73: "❄️",
                75: "❄️",
                80: "🌦️",
                81: "🌧️",
                82: "🌧️",
                95: "⛈️"
            };

            const icon = hourlyWeatherCodes[hourly.weather_code[i]] || "🌡️";

            card.innerHTML = `
    <p>${hour}</p>
    <h2>${icon}</h2>
    <h3>${hourly.temperature_2m[i]}°C</h3>
    <p>${hourly.precipitation_probability[i]}% rain</p>
`;

            hourlyContainer.appendChild(card);
        }

        // Display 7-day forecast
        const daily = weatherData.daily;

        const weeklyContainer = document.getElementById("weeklyContainer");

        weeklyContainer.innerHTML = "";

        const dailyWeatherCodes = {
            0: "☀️",
            1: "🌤️",
            2: "⛅",
            3: "☁️",
            45: "🌫️",
            48: "🌫️",
            51: "🌦️",
            53: "🌧️",
            55: "🌧️",
            61: "🌧️",
            63: "🌧️",
            65: "🌧️",
            71: "🌨️",
            73: "❄️",
            75: "❄️",
            80: "🌦️",
            81: "🌧️",
            82: "🌧️",
            95: "⛈️"
        };

        for (let i = 0; i < daily.time.length; i++) {

            const day = new Date(daily.time[i] + "T00:00:00")
                .toLocaleDateString("en-US", {
                    weekday: "short"
                });

            const icon = dailyWeatherCodes[daily.weather_code[i]] || "🌡️";

            const card = document.createElement("div");

            card.classList.add("weekly-card");

            card.innerHTML = `
        <p>${day}</p>
        <h2>${icon}</h2>
        <h3>${daily.temperature_2m_max[i]}°C</h3>
        <p>Low: ${daily.temperature_2m_min[i]}°C</p>
        <p>${daily.precipitation_probability_max[i]}% rain</p>
    `;

            weeklyContainer.appendChild(card);
        }

        temperature.textContent =
            `${current.temperature_2m}°C`;

        humidity.textContent =
            `${current.relative_humidity_2m}%`;

        windSpeed.textContent =
            `${current.wind_speed_10m} km/h`;

        // STEP 4: Display weather condition
        const weatherCodes = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Heavy drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            80: "Rain showers",
            81: "Moderate rain showers",
            82: "Heavy rain showers",
            95: "Thunderstorm"
        };

        weatherDescription.textContent =
            weatherCodes[current.weather_code] || "Unknown condition";

        // STEP 5: Display today's date
        date.textContent = new Date().toDateString();
        cityInput.value = "";

    } catch (error) {

        console.log(error);
        cityName.textContent = "Unable to get weather information.";

    } finally {

        searchBtn.disabled = false;
        searchBtn.textContent = "Search";

    }
}