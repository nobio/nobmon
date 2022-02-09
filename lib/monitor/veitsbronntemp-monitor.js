const axios = require('axios');
class VeitsbronnTempMonitor {

  constructor(handlers) {
    console.log('Veitsbronn Temperature Monitoring');
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
      const temp = Math.round((resp.data.main.temp - 273.15) * 100) / 100;
      data.push({ name: 'veitsbronn-temperature', topic: 'temp', type: 'float', value: temp });
      console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Temperature ${temp}°C`);

      // wind speed................................................................
      data.push({ name: 'veitsbronn-windspeed', topic: 'windspeed', type: 'float', value: resp.data.wind.speed });
      console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Wind Speed ${resp.data.wind.speed}m/s`);
      this.handlers.forEach(handler => { handler.send(data); });

      // humidity................................................................
      data.push({ name: 'veitsbronn-humidity', topic: 'humidity', type: 'int', value: resp.data.main.humidity });
      console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Humidity ${resp.data.main.humidity}`);
      this.handlers.forEach(handler => { handler.send(data); });

      // pressure................................................................
      data.push({ name: 'veitsbronn-pressure', topic: 'pressure', type: 'int', value: resp.data.main.pressure });
      console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Pressure ${resp.data.main.pressure}`);
      this.handlers.forEach(handler => { handler.send(data); });

    } catch (error) {
      console.error(error);
    }
  }

}
module.exports = VeitsbronnTempMonitor;
