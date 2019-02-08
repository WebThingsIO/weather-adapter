const Provider = require('./provider');
const fetch = require('node-fetch');

const BASE_URL = 'https://api.darksky.net/forecast';

class DarkSkyProvider extends Provider {
  constructor(location, units, apiKey) {
    super(location, units, apiKey);
    this.data = null;
  }

  poll() {
    const exclude = 'minutely,hourly,daily,alerts,flags';
    const units = this.units === 'imperial' ? 'us' : 'si';
    const url = `${BASE_URL}/${this.apiKey}/${this.location.latitude},${
      this.location.longitude}?exclude=${exclude}&units=${units}`;

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

    return Math.round(this.data.currently.temperature || 0);
  }

  pressure() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.currently.pressure || 0);
  }

  humidity() {
    if (!this.data) {
      return null;
    }

    return Math.round((this.data.currently.humidity || 0) * 100);
  }

  windSpeed() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.currently.windSpeed || 0);
  }

  windDirection() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.currently.windBearing || 0);
  }

  description() {
    if (!this.data) {
      return null;
    }

    return this.data.currently.summary;
  }
}

module.exports = DarkSkyProvider;
