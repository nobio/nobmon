const Fritzbox = require('fritznode');
class FritzboxMonitor {

  isFritzboxConnecting = false;

  constructor(handlers) {
    console.log('FritzBox Bandwidth Monitoring');
    this.handlers = handlers;
    this.delay = process.env.FRITZ_DELAY || 5;
    this.connectFritzBox();
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

  /**
   * connect to fritz box; config see .env
   */
  connectFritzBox = async () => {
    if (!this.isFritzboxConnecting) {
      this.isFritzboxConnecting = true;
      console.log(`connecting to FritzBox...`);
      //return await Fritzbox.fritz();  // options are taken from process.env that are loaded from .env file
      while (!this.conFritz) {
        this.conFritz = await Fritzbox.fritz();
      }
      this.isFritzboxConnecting = false;
      console.log(`...done connecting Fritzbox`);
    } else {
      console.log(`sorry, still connecting to Fritzbox...`);
    }
  }

  async monitor() {
    try {
      if (this.conFritz) {

        const usage = await this.conFritz.getBandwithUsage();
        const factUp = Math.round(1000 * ((usage.upCurrent) / usage.upMax)) / 10;
        const factDown = Math.round(1000 * ((usage.downCurrent) / usage.downMax)) / 10;

        const data = [];
        data.push({ name: 'upstream_current', topic: 'bndw', type: 'int', value: usage.upCurrent });
        data.push({ name: 'downstream_current', topic: 'bndw', type: 'int', value: usage.downCurrent });
        data.push({ name: 'upstream_mbit', topic: 'bndw', type: 'float', value: usage.upCurrent / 1024 / 1024 });
        data.push({ name: 'downstream_mbit', topic: 'bndw', type: 'float', value: usage.downCurrent / 1024 / 1024 });
        data.push({ name: 'downstream_max', topic: 'max', type: 'float', value: usage.downMax });
        data.push({ name: 'upstream_max', topic: 'max', type: 'float', value: usage.upMax });

        console.log(`${new Date().toLocaleString()} | monitoring Fritzbox Up: ${factUp}% Down: ${factDown}%`);

        this.handlers.forEach(handler => {
          handler.send(data);
        });
      } else {
        this.connectFritzBox();
      }
    } catch (error) {
      console.error(error);
      this.connectFritzBox();
    }
  }

}
module.exports = FritzboxMonitor;
