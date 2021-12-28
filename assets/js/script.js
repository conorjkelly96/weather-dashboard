const currentWeatherContainer = $("#current-weather-container");
const forecastWeatherContainer = $("#forecast-container");
const clearHistoryBtn = $("clear-history-btn");

const API_KEY = "708fa10260c22a09e8551c978be4e26d";

const getCurrentData = (name, forecastData) {
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

// add bulma.io
const getUVIClassName = (uvi) => {
  if (uvi >= 0 && uvi < 3) {
    return "button is-success";
  } else if (uvi >= 3 && uvi < 6) {
    return "button is-warning";
  } else if (uvi >= 6 && uvi < 8) {
    return "button is-danger";
  } else {
    return "button is-black";
  }
};

const setCitiesInLS = (cityName) => {
  // get cities from LS
  const cities = JSON.parse(localStorage.getItem("recentCities")) ?? [];

  // if city does not exist
  if (!cities.includes(cityName)) {
    // insert cityName in cities
    cities.push(cityName);

    // set cities in LS
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
};

const getFormattedDate = (unixTimestamp) => {
  return moment.unix(unixTimestamp).format("ddd DD/MM/YYYY");
};

const getIconCode = function () {
  return;
};

const getForecastData = (forecastData) => {
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

const renderCurrentWeatherCard = (currentData) => {
  const currentWeatherCard = `<div class="tile is-child box">
        <h2 class="title">${currentData.name} ${currentData.date} 
        <img src="https://openweathermap.org/img/w/${
          currentData.iconCode
        }.png" />
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
        UV index: <span class="${getUVIClassName(currentData.uvi)}">${
    currentData.uvi
  }</span></ul>
    </div>`;

  currentWeatherContainer.append(currentWeatherCard);
};

// constructing forecast cards
const renderForecastWeatherCards = (forecastData) => {
  const constructForecastCard = function (each) {
    return `<div class="tile is-ancestor">
    <div class="tile is-vertical is-parent mx-3">
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

  forecastWeatherContainer.append(forecastCards);
};

// constructing weather cards
const renderWeatherCards = (weatherData) => {
  renderCurrentWeatherCard(weatherData.current);

  renderForecastWeatherCards(weatherData.forecast);
};

const renderWeatherInfo = async (cityName) => {
  const weatherData = await getWeatherData(cityName);

  currentWeatherContainer.empty();
  forecastWeatherContainer.empty();

  renderWeatherCards(weatherData);
};

const renderRecentCities = () => {
  // get cities from LS
  const cities = JSON.parse(localStorage.getItem("recentCities")) ?? [];

  const citiesContainer = $("#city-list");

  citiesContainer.empty();

  const constructAndAppendCity = (city) => {
    const searchEl = `<button data-city=${city} class="button is-info ml-3">${city}</button>`;
    citiesContainer.append(searchEl);
  };

  const handleClick = (event) => {
    const target = $(event.target);

    // if click is from button only
    if (target.is("button")) {
      // get city name
      const cityName = target.data("city");

      // render weather info with city name
      renderWeatherInfo(cityName);
    }
  };

  citiesContainer.on("click", handleClick);

  cities.forEach(constructAndAppendCity);
};

const deleteFromLocalStorage = () => {
  // delete from local storage
};

const handleSearch = async (event) => {
  event.preventDefault();

  const cityName = $("#city-input").val();

  if (cityName) {
    renderWeatherInfo(cityName);

    setCitiesInLS(cityName);

    renderRecentCities();
  }
};

$("#search-form").on("submit", handleSearch);
$(document).ready(handleReady);
