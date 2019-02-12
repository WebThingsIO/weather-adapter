const Provider = require('./provider');
const fetch = require('node-fetch');

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

class OpenWeatherMapProvider extends Provider {
  constructor(location, units, apiKey) {
    super(location, units, apiKey);
    this.data = null;
  }

  poll() {
    const url = `${BASE_URL}?lat=${this.location.latitude}&lon=${
      this.location.longitude}&units=${this.units}&appid=${this.apiKey}`;

    return fetch(url).then((res) => {
      return res.json();
    }).then((body) => {
      this.data = body;
    });
  }

  temperature() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.main.temp);
  }

  pressure() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.main.pressure);
  }

  humidity() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.main.humidity);
  }

  windSpeed() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.wind.speed);
  }

  windDirection() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.wind.deg);
  }

  description() {
    if (!this.data) {
      return null;
    }

    return this.data.weather[0].description;
  }

  raining() {
    if (!this.data) {
      return null;
    }

    // This is not super accurate, but it's the best we can do with this API.
    return this.data.hasOwnProperty('rain') &&
      ((this.data.rain.hasOwnProperty('1h') && this.data.rain['1h'] > 0) ||
       (this.data.rain.hasOwnProperty('3h') && this.data.rain['3h'] > 0));
  }

  snowing() {
    if (!this.data) {
      return null;
    }

    // This is not super accurate, but it's the best we can do with this API.
    return this.data.hasOwnProperty('snow') &&
      ((this.data.snow.hasOwnProperty('1h') && this.data.snow['1h'] > 0) ||
       (this.data.snow.hasOwnProperty('3h') && this.data.snow['3h'] > 0));
  }
}

module.exports = OpenWeatherMapProvider;
