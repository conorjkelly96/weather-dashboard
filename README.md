# Weather Dashboard

Using 3rd party APIs to generate results based on user search input. 

## Technologies

- JavaScript
- HTML5
- CSS3
  - bulma.io


## API Connection

In order to obtain weather data for each city searched by the user, an asynchronous function was created in order to get: 
- city latitude
- city longitude
- city name 

```javascript
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
```
## Usage

This application will allow users to CREATE, READ, UPDATE and DELETE tags, products & categories.
