/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
import { execSync } from 'child_process';

/**
 * monitors the local temperature; works find with Raspberry Pi
 */
export class RaspiTempMonitor {
  constructor(handlers) {
    console.log('Local Temperature');
    this.handlers = handlers;
    this.platform = process.platform;
    this.delay = process.env.TEMP_DELAY || 5;
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
    const temperature = await this.temperature();
    console.log(`${new Date().toLocaleString()} | monitoring Temperature ${temperature.temp}°C`);

    const data = [{
      name: 'cpu-temperature', topic: 'temp', type: 'float', value: temperature.temp,
    }];
    this.handlers.forEach((handler) => {
      handler.send(data);
    });
  }

  // cat /sys/class/thermal/thermal_zone0/temp && vcgencmd measure_temp
  // -> 52582 (milli Grad)
  // sysctl -a | grep cpu_thermal_level
  // -> machdep.xcpm.cpu_thermal_level: 61
  temperature = async () => {
    let cmd;
    let temp;

    // prepare cli command depending on platform
    if (this.platform === 'darwin') {
      cmd = 'sysctl -a | grep cpu_thermal_level';
    } else if (this.platform === 'linux') {
      cmd = 'cat /sys/class/thermal/thermal_zone0/temp ';
    }
    // console.log(cmd)

    // exec command
    const lsx = execSync(cmd);
    // console.log(lsx.toString('UTF8'));

    // evaluate cli response depending on platform
    if (this.platform === 'darwin') {
      temp = lsx.toString('UTF8').split(': ')[1].trim();
    } else if (this.platform === 'linux') {
      temp = Math.round(lsx.toString('UTF8') / 10) / 100;
    }

    // return temperature
    return { temp };
  };
}
