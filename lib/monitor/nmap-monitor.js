const { execSync } = require('child_process');

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
    console.log(`${new Date().toLocaleString()} | monitoring precence of devices ${devices.devices}`);

    const data = [{ name: 'devices', topic: 'precence', type: 'int', value: devices.devices }];
    this.handlers.forEach(handler => {
      handler.send(data);
    });
  }


  nmap = async () => {
    let cmd;

    // prepare cli command depending on platform
    if (this.platform == 'darwin') {
      cmd = `/usr/local/bin/nmap -v -sn 192.168.178.0/24|grep 'Host is up'|wc -l`;
    } else if (this.platform == 'linux') {
      cmd = `/usr/bin/nmap -v -sn 192.168.178.0/24|grep 'Host is up'|wc -l`;
    }

    // exec command
    const lsx = execSync(cmd);
    //console.log(lsx.toString('UTF8'));

    // evaluate cli response depending on platform
    const devices = lsx.toString('UTF8').trim();

    // return number of devices
    return { devices };
  }

}

module.exports = NMapMonitor;
