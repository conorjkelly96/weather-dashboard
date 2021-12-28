const currentWeatherContainer = $("#current-weather-container");
const forecastWeatherContainer = $("#forecast-container");
const clearHistoryBtn = $("clear-history-btn");
const clearHistoryDiv = $("#clear-history-div");
const citiesContainer = $("#city-list");

const API_KEY = "708fa10260c22a09e8551c978be4e26d";

const getCurrentData = (name, forecastData) => {
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

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const setCitiesInLS = (cityName) => {
  // get cities from LS
  const cities = JSON.parse(localStorage.getItem("recentCities")) ?? [];

  // if city does not exist
  if (!cities.includes(cityName)) {
    // insert cityName in cities
    cities.push(cityName);

    // set cities in LS
    try {
      localStorage.setItem("recentCities", JSON.stringify(cities));
    } catch (error) {
      console.log("ERR:", error.message);
    }
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

// const getWeatherData = async (cityName) => {
//   try {
//     const currentDataUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
//     const currentDataResponse = await fetch(currentDataUrl);
//     const currentData = await currentDataResponse.json();

//     const lat = currentData.coord.lat;
//     const lon = currentData.coord.lon;
//     const name = currentData.name;

//     const forecastDataUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;

//     const forecastDataResponse = await fetch(forecastDataUrl);
//     const forecastData = await forecastDataResponse.json();

//     const current = getCurrentData(name, forecastData);
//     const forecast = getForecastData(forecastData);

//     return {
//       current: current,
//       forecast: forecast,
//     };
//   } catch (error) {
//     console.log("ERR:", error.message);
//   }
// };

const getWeatherData = async (cityName) => {
  const currentDataUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
  const currentDataResponse = await fetch(currentDataUrl);
  console.log(currentDataResponse.status);

  if (currentDataResponse.status === 404) {
    alert("Invalid city name, please try again");
  } else {
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
  }
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
  try {
    renderCurrentWeatherCard(weatherData.current);
    renderForecastWeatherCards(weatherData.forecast);
  } catch (error) {
    console.log("ERR:", error.message);
  }
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

const handleClickForDeleteLS = function (event) {
  // target the clear history button
  const target = $(event.target);

  if (target.is("button")) {
    localStorage.clear();
    citiesContainer.remove();
    forecastWeatherContainer.remove();
    currentWeatherContainer.remove();
  }

  // once the button is clicked, clear everything from local storage
  // remove all the tags from the div
};

clearHistoryDiv.on("click", handleClickForDeleteLS);

const handleSearch = async (event) => {
  event.preventDefault();

  const userSearch = $("#city-input").val();
  const cityName = capitalizeFirstLetter(userSearch);

  if (cityName) {
    renderWeatherInfo(cityName);

    setCitiesInLS(cityName);

    renderRecentCities();
  }
};

const handleReady = () => {
  // render recent cities
  renderRecentCities();

  // get cities from LS
  const cities = JSON.parse(localStorage.getItem("recentCities")) ?? [];

  // if there are recent cities get the info for the most recent city
  if (cities.length) {
    const cityName = cities[cities.length - 1];
    renderWeatherInfo(cityName);
  }
};

$("#search-form").on("submit", handleSearch);
$(document).ready(handleReady);
