const Provider = require('./provider');
const fetch = require('node-fetch');

const BASE_URL = 'https://dataservice.accuweather.com';

class AccuWeatherProvider extends Provider {
  constructor(location, units, apiKey) {
    super(location, units, apiKey);

    this.locationKey = null;
    this.dataUnit = units === 'imperial' ? 'Imperial' : 'Metric';
    this.data = null;
  }

  poll() {
    let promise;
    if (!this.locationKey) {
      const searchUrl = `${BASE_URL}/locations/v1/cities/` +
        `geoposition/search?q=${this.location.latitude},${
          this.location.longitude}&apikey=${this.apiKey}`;

      promise = fetch(searchUrl).then((res) => {
        return res.json();
      }).then((body) => {
        if (body.Key) {
          this.locationKey = body.Key;
        } else {
          throw new Error('Location not found');
        }
      });
    } else {
      promise = Promise.resolve();
    }

    return promise.then(() => {
      const url = `${BASE_URL}/currentconditions/v1/${this.locationKey}` +
        `?apikey=${this.apiKey}&details=true`;
      return fetch(url);
    }).then((res) => {
      return res.json();
    }).then((body) => {
      this.data = body[0];
    });
  }

  externalUrl() {
    if (!this.data) {
      return null;
    }

    return this.data.Link;
  }

  temperature() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.Temperature[this.dataUnit].Value);
  }

  pressure() {
    if (!this.data) {
      return null;
    }

    // The other providers just use hPa for this, so let's stick with that.
    return Math.round(this.data.Pressure.Metric.Value);
  }

  humidity() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.RelativeHumidity);
  }

  clouds() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.CloudCover);
  }
  
  windSpeed() {
    if (!this.data) {
      return null;
    }

    let value = Math.round(this.data.Wind.Speed[this.dataUnit].Value);

    // If metric, convert from km/h to m/s.
    if (this.units === 'metric') {
      value *= 1000 / (60 * 60);
    }

    return value;
  }

  windDirection() {
    if (!this.data) {
      return null;
    }

    return Math.round(this.data.Wind.Direction.Degrees);
  }

  description() {
    if (!this.data) {
      return null;
    }

    return this.data.WeatherText;
  }

  raining() {
    if (!this.data) {
      return null;
    }

    return this.data.HasPrecipitation &&
      ['Rain', 'Ice', 'Mixed'].includes(this.data.PrecipitationType);
  }

  snowing() {
    if (!this.data) {
      return null;
    }

    return this.data.HasPrecipitation &&
      ['Snow', 'Ice', 'Mixed'].includes(this.data.PrecipitationType);
  }
}

module.exports = AccuWeatherProvider;
