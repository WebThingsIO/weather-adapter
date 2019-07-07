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

  externalUrl() {
    return `https://darksky.net/forecast/${this.location.latitude},${
      this.location.longitude}`;
  }

  temperature() {
    if (!this.data || !this.data.currently.hasOwnProperty('temperature')) {
      return null;
    }

    return Math.round(this.data.currently.temperature);
  }

  pressure() {
    if (!this.data || !this.data.currently.hasOwnProperty('pressure')) {
      return null;
    }

    return Math.round(this.data.currently.pressure);
  }

  humidity() {
    if (!this.data) {
      return null;
    }

    return Math.round((this.data.currently.humidity || 0) * 100);
  }

  clouds() {
    if (!this.data) {
      return null;
    }

    return Math.round((this.data.currently.cloudcover || 0) * 100);
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

  raining() {
    if (!this.data) {
      return null;
    }

    return this.data.currently.hasOwnProperty('precipType') &&
      ['rain', 'sleet'].includes(this.data.currently.precipType);
  }

  snowing() {
    if (!this.data) {
      return null;
    }

    return this.data.currently.hasOwnProperty('precipType') &&
      ['snow', 'sleet'].includes(this.data.currently.precipType);
  }
}

module.exports = DarkSkyProvider;
