const nmap = require('node-nmap');
nmap.nmapLocation = 'nmap'; //default
const NETWORK_ADRESS = process.env.NMAP_NETWORK_ADRESS;

/**
 * monitors the local temperature; works find with Raspberry Pi
 */
class NMapMonitor {

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

    const data = [{ name: 'devices', topic: 'precence', type: 'int', value: devices }];
    this.handlers.forEach(handler => {
      handler.send(data);
    });
  }


  nmap = async () => {
    return new Promise((resolve, reject) => {
      const quickscan = new nmap.QuickScan(NETWORK_ADRESS);

      quickscan.on('error', (error) => {
        console.error(error);
        reject(error);
      });

      quickscan.on('complete', (data) => {
        console.log(`nmap found ${data.length} entries`);
        resolve(data.length)
      });

    });
  }
}

module.exports = NMapMonitor;
