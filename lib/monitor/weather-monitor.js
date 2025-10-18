/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
import axios from 'axios';

export class WeatherMonitor {
  constructor(handlers) {
    console.log('Weather Monitoring');
    this.handlers = handlers;
    this.delay = process.env.OWM_DELAY || 60 * 5;
    this.omv_url = `${process.env.OMV_BASEURL}?appid=${process.env.OMV_APPID}&lang=de`;
    this.locations = process.env.OMV_LOCATIONS.split(',').map((element) => element.trim());
    this.monitor();
  }

  run = async () => {
    setInterval(async () => {
      try {
        // console.log(`${new Date().toISOString()} -> monitor`);
        this.monitor();
      } catch (error) {
        console.error(error);
      }
    }, this.delay * 1000);
  };

  async monitor() {
    this.locations.forEach((loc) => {
      this.monitorLoc(loc);
    });
  }

  async monitorLoc(loc) {
    try {
      const URL = `${this.omv_url}&q=${loc}`;
      const displayLoc = loc.toLowerCase();
      // console.log(URL);
      const resp = await axios.get(URL);
      // console.log(resp.data)
      if (!resp) return;
      if (!resp.status === 200) return;
      if (!resp.data) return;
      if (!resp.data.main) return;
      if (!resp.data.main.temp) return;

      const data = [];

      // temperature ................................................................
      if (resp.data.main.temp) {
        const temp = Math.round((resp.data.main.temp - 273.15) * 100) / 100;
        data.push({
          name: `${displayLoc}-temperature`, topic: 'weather', type: 'float', value: temp,
        });
        console.log(`${new Date().toLocaleString()} | monitoring ${loc} Temperature ${temp}°C`);
      }

      // wind speed................................................................
      if (resp.data.wind.speed) {
        data.push({
          name: `${displayLoc}-windspeed`, topic: 'weather', type: 'float', value: resp.data.wind.speed,
        });
        console.log(`${new Date().toLocaleString()} | monitoring ${loc} Wind Speed ${resp.data.wind.speed}m/s`);
        this.handlers.forEach((handler) => { handler.send(data); });
      }

      // wind direction................................................................
      if (resp.data.wind.deg) {
        data.push({
          name: `${displayLoc}-winddir`, topic: 'weather', type: 'int', value: resp.data.wind.deg,
        });
        console.log(`${new Date().toLocaleString()} | monitoring ${loc} Wind Direction ${resp.data.wind.deg}°`);
        this.handlers.forEach((handler) => { handler.send(data); });
      }

      // humidity................................................................
      if (resp.data.main.humidity) {
        data.push({
          name: `${displayLoc}-humidity`, topic: 'weather', type: 'int', value: resp.data.main.humidity,
        });
        console.log(`${new Date().toLocaleString()} | monitoring ${loc} Humidity ${resp.data.main.humidity}%`);
        this.handlers.forEach((handler) => { handler.send(data); });
      }

      // pressure................................................................
      if (resp.data.main.pressure) {
        data.push({
          name: `${displayLoc}-pressure`, topic: 'weather', type: 'int', value: resp.data.main.pressure,
        });
        console.log(`${new Date().toLocaleString()} | monitoring ${loc} Pressure ${resp.data.main.pressure}`);
        this.handlers.forEach((handler) => { handler.send(data); });
      }

      // clouds................................................................
      if (resp.data.clouds.all) {
        data.push({
          name: `${displayLoc}-clouds`, topic: 'weather', type: 'int', value: resp.data.clouds.all,
        });
        console.log(`${new Date().toLocaleString()} | monitoring ${loc} Clouds ${resp.data.clouds.all}%`);
        this.handlers.forEach((handler) => { handler.send(data); });
      }

      // rain................................................................
      if (resp.data.rain && resp.data.rain['1h']) {
        data.push({
          name: `${displayLoc}-rain`, topic: 'weather', type: 'float', value: resp.data.rain['1h'],
        });
        console.log(`${new Date().toLocaleString()} | monitoring ${loc} Rain (1h) ${resp.data.rain['1h']}mm`);
        this.handlers.forEach((handler) => { handler.send(data); });
      }

      // weather................................................................
      if (resp.data.weather[0].id) {
        data.push({
          name: `${displayLoc}-weather`, topic: 'weather', type: 'int', value: resp.data.weather[0].id,
        });
        console.log(`${new Date().toLocaleString()} | monitoring ${loc} Wetter ID '${resp.data.weather[0].id}'`);
        this.handlers.forEach((handler) => { handler.send(data); });
      }
    } catch (error) {
      console.error(error);
    }
  }
}
