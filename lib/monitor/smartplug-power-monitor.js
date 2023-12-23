/* eslint-disable import/extensions */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
import { MerossSmartPlug } from '../util/smart-plug.js';

export class SmartPlugPowerMonitor {
  constructor(handlers) {
    console.log('Smart Plug Power Monitor');
    this.handlers = handlers;
    this.delay = process.env.SMARTPLUG_DELAY || 1;
    this.hosts = process.env.SMARTPLUG_HOSTS.split(', ');
    this.key = process.env.SMARTPLUG_KEY;
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
    try {
      this.hosts.forEach((host) => {
        const plug = new MerossSmartPlug(host, this.key);
        plug.getElectricity()
          .then((resp) => {
            // console.log(host);
            if (!resp) return;
            if (!resp.current === undefined || !resp.voltage === undefined || !resp.power === undefined) return;

            const power = resp.power / 1000;
            const current = resp.current / 1000;
            const voltage = resp.voltage / 10;
            const data = [
              {
                name: `smartplug-${host}`, topic: 'power', type: 'float', value: power,
              },
              {
                name: `smartplug-${host}`, topic: 'current', type: 'float', value: current,
              },
              {
                name: `smartplug-${host}`, topic: 'voltage', type: 'float', value: voltage,
              },
            ];

            console.log(`${new Date().toLocaleString()} | monitoring SmartPluginPower power ${power}W, ${current}A, ${voltage}V to host ${host}`);

            this.handlers.forEach((handler) => {
              handler.send(data);
            });
          })
          .catch((err) => { console.error(err); });
      });
    } catch (error) {
      console.error(error);
    }
  }
}
