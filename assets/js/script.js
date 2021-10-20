const currentWeatherContainer = $("#current-weather-container");
const forecastWeatherContainer = $("#forecast-container");

const API_KEY = "708fa10260c22a09e8551c978be4e26d";

const getCurrentData = function (name, forecastData) {
  return {
    name: name,
    temperature: forecastData.current.temp,
    wind: forecastData.current.wind_speed,
    humidity: forecastData.current.humidity,
    uvi: forecastData.current.uvi,
    date: getFormattedDate(forecastData.current.dt),
    iconCode: forecastData.current.weather[0].icon,
  };
};

const getFormattedDate = function (unixTimestamp) {
  return moment.unix(unixTimestamp).format("ddd DD/MM/YYYY");
};

const getIconCode = function () {
  return;
};

const getForecastData = function (forecastData) {
  const callback = function (each) {
    console.log(each);
    return {
      date: getFormattedDate(each.dt),
      temperature: each.temp.max,
      wind: each.wind_speed,
      humidity: each.humidity,
      iconCode: each.weather[0].icon,
      uvi: each.uvi,
    };
  };

  return forecastData.daily.slice(1, 6).map(callback);
};

const getWeatherData = async (cityName) => {
  const currentDataUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
  const currentDataResponse = await fetch(currentDataUrl);
  const currentData = await currentDataResponse.json();

  const lat = currentData.coord.lat;
  const lon = currentData.coord.lon;
  const name = currentData.name;

  const forecastDataUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;

  const forecastDataResponse = await fetch(forecastDataUrl);
  const forecastData = await forecastDataResponse.json();

  const current = getCurrentData(name, forecastData);
  const forecast = getForecastData(forecastData);

  return {
    current: current,
    forecast: forecast,
  };
};

const renderCurrentWeatherCard = function (currentData) {
  //   const currentWeatherCard = `<div class="card-body bg-white border mb-2">
  //     <h2 class="card-title">
  //         ${currentData.name} ${currentData.date}
  //         <img src="https://openweathermap.org/img/w/${currentData.iconCode}.png" />
  //     </h2>
  //     <p class="card-text">Temp: ${currentData.temperature}&deg;F</p>
  //     <p class="card-text">Wind: ${currentData.wind} MPH</p>
  //     <p class="card-text">Humidity: ${currentData.humidity}%</p>
  //     <p class="card-text">
  //         UV index: <span class="btn btn-primary">${currentData.uvi}</span>
  //     </p>
  //     </div>`;

  const currentWeatherCard = `<div class="tile is-child box">
        <h2 class="title">${currentData.name} ${currentData.date} 
        <img src="https://openweathermap.org/img/w/${currentData.iconCode}.png" />
        </h2>
        <ul>
        Temperature:${currentData.temperature}&deg;F
        </ul>
        <ul>
        Wind:${currentData.wind} MPH
        </ul>
        <ul>
        Humidity:${currentData.humidity}%
        </ul>
        <ul>
        UV Index:${currentData.uvi}
        </ul>
    </div>`;

  currentWeatherContainer.append(currentWeatherCard);
};

// constructing forecast cards
const renderForecastWeatherCards = function (forecastData) {
  const constructForecastCard = function (each) {
    return `<div class="tile is-ancestor">
    <div class="tile is-5 is-vertical is-parent">
      <div class="tile is-child box">
      <img src="https://openweathermap.org/img/w/${each.iconCode}.png" />
      <h5 class="card-title">${each.date}</h5>
        <ul>
          Temperature:${each.temperature}
        </ul>
        <ul>
          Wind:${each.wind} MPH
        </ul>
        <ul>
          Humidity:${each.humidity}%
        </ul>
        <ul>
          UV Index:${each.uvi}
        </ul>
      </div>
    </div>
  </div>`;
  };

  const forecastCards = forecastData.map(constructForecastCard).join("");

  //   const forecastCardsContainer = `<div class="forecast-container">
  //     <h3 class="">5-Day Forecast:</h3>
  //     <div
  //         class=""
  //         id=""
  //     >${forecastCards}</div>
  //     </div>`;

  forecastWeatherContainer.append(forecastCards);
};

// constructing weather cards
const renderWeatherCards = function (weatherData) {
  renderCurrentWeatherCard(weatherData.current);

  renderForecastWeatherCards(weatherData.forecast);
};

const handleSearch = async function (event) {
  event.preventDefault();

  const cityName = $("#city-input").val();

  if (cityName) {
    const weatherData = await getWeatherData(cityName);

    currentWeatherContainer.empty();

    renderWeatherCards(weatherData);

    // save city to LS
  }
};

$("#search-form").on("submit", handleSearch);
