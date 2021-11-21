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
      if (!resp) return;
      if (!resp.status == 200) return;
      if (!resp.data) return;
      if (!resp.data.main) return;
      if (!resp.data.main.temp) return;

      const temp = Math.round((resp.data.main.temp - 273.15) * 100) / 100;
      const data = [{ name: 'veitsbronn-temperature', topic: 'temp', type: 'float', value: temp }];
      console.log(`${new Date().toLocaleString()} | monitoring Veitsbronn Temperature ${temp}°C`);

      this.handlers.forEach(handler => {
        handler.send(data);
      });
    } catch (error) {
      console.error(error);
    }
  }

}
module.exports = VeitsbronnTempMonitor;
