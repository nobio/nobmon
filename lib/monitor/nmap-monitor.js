/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */

import nmap from 'node-nmap';// const { nmap } = NMap;
// const nmap = require('node-nmap');  // node-nmap's not an ES6 module
// import pkg from 'node-nmap';
// const { nmap } from 'node-nmap';

nmap.nmapLocation = 'nmap'; // default
const NETWORK_ADRESS = process.env.NMAP_NETWORK_ADRESS;

/**
 * monitors the local temperature; works find with Raspberry Pi
 */
export class NMapMonitor {
  constructor(handlers) {
    console.log('NMAP - counting devices in network');
    this.handlers = handlers;
    this.platform = process.platform;
    this.delay = process.env.NMAP_DELAY || 60;
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
    const devices = await this.nmap();
    console.log(`${new Date().toLocaleString()} | monitoring precence of devices ${devices}`);

    const data = [{
      name: 'devices', topic: 'precence', type: 'int', value: devices,
    }];
    this.handlers.forEach((handler) => {
      handler.send(data);
    });
  }

  nmap = async () => new Promise((resolve, reject) => {
    const scan = new nmap.QuickScan(NETWORK_ADRESS);

    scan.on('error', (error) => {
      console.error(error);
      reject(error);
    });

    scan.on('complete', (data) => {
      // console.log(`nmap found ${data.length} entries`);
      resolve(data.length);
    });
  });
}
