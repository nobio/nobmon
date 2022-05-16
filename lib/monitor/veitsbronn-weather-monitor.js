const axios = require('axios');
class VeitsbronnWeatherMonitor {

  constructor(handlers) {
    console.log('Veitsbronn Weather Monitoring');
    this.handlers = handlers;
    this.delay = process.env.OWM_VEITSBRONN_DELAY || 60 * 5;
    this.monitor()
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
    try {
      console.log(process.env.OWM_VEITSBRONN_URL)
      const resp = await axios.get(process.env.OWM_VEITSBRONN_URL);
      //console.log(resp.data)
      if (!resp) return;
      if (!resp.status == 200) return;
      if (!resp.data) return;
      if (!resp.data.main) return;
      if (!resp.data.main.temp) return;

      let data = [];

      // temperature ................................................................
      if (resp.data.main.temp) {
        const temp = Math.round((resp.data.main.temp - 273.15) * 100) / 100;
        data.push({ name: 'veitsbronn-temperature', topic: 'temp', type: 'float', value: temp });
        console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Temperature ${temp}°C`);
      }

      // wind speed................................................................
      if (resp.data.wind.speed) {
        data.push({ name: 'veitsbronn-windspeed', topic: 'windspeed', type: 'float', value: resp.data.wind.speed });
        console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Wind Speed ${resp.data.wind.speed}m/s`);
        this.handlers.forEach(handler => { handler.send(data); });
      }

      // wind direction................................................................
      if (resp.data.wind.deg) {
        data.push({ name: 'veitsbronn-winddir', topic: 'winddir', type: 'int', value: resp.data.wind.deg });
        console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Wind Direction ${resp.data.wind.deg}°`);
        this.handlers.forEach(handler => { handler.send(data); });
      }

      // humidity................................................................
      if (resp.data.main.humidity) {
        data.push({ name: 'veitsbronn-humidity', topic: 'humidity', type: 'int', value: resp.data.main.humidity });
        console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Humidity ${resp.data.main.humidity}%`);
        this.handlers.forEach(handler => { handler.send(data); });
      }

      // pressure................................................................
      if (resp.data.main.pressure) {
        data.push({ name: 'veitsbronn-pressure', topic: 'pressure', type: 'int', value: resp.data.main.pressure });
        console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Pressure ${resp.data.main.pressure}`);
        this.handlers.forEach(handler => { handler.send(data); });
      }

      // clouds................................................................
      if (resp.data.clouds.all) {
        data.push({ name: 'veitsbronn-clouds', topic: 'clouds', type: 'int', value: resp.data.clouds.all });
        console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Clouds ${resp.data.clouds.all}%`);
        this.handlers.forEach(handler => { handler.send(data); });
      }

      // rain................................................................
      if (resp.data.rain && resp.data.rain['1h']) {
        data.push({ name: 'veitsbronn-rain', topic: 'rain', type: 'float', value: resp.data.rain['1h'] });
        console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Rain (1h) ${resp.data.rain['1h']}mm`);
        this.handlers.forEach(handler => { handler.send(data); });
      }

    } catch (error) {
      console.error(error);
    }
  }

}
module.exports = VeitsbronnWeatherMonitor;
