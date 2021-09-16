const { execSync } = require('child_process');
const { Point } = require('@influxdata/influxdb-client');

/**
 * monitors the local temperature; works find with Raspberry Pi
 */
class RaspiTempMonitor {

  constructor(influxdb) {
    this.platform = process.platform;
    this.influxdb = influxdb;
    this.delay = process.env.TEMP_DELAY || 5;
  }

  run = async () => {
    setInterval(async () => {
      try {
        // console.log(`${new Date().toISOString()} -> monitor`);
        this.monitor();
      } catch (error) {
        console.error(error);
        conInflux = await connectInfluxDB();
        console.log(`reconnecting influxdb...`);
      }
    }, this.delay * 1000);
  };


  //cat /sys/class/thermal/thermal_zone0/temp && vcgencmd measure_temp
  // -> 52582 (milli Grad)
  //sysctl -a | grep cpu_thermal_level
  // -> machdep.xcpm.cpu_thermal_level: 61
  temperature = async () => {
    let cmd;
    let temp;

    // prepare cli command depending on platform
    if (this.platform == 'darwin') {
      cmd = 'sysctl -a | grep cpu_thermal_level';
    } else if (this.platform == 'linux') {
      cmd = 'cat /sys/class/thermal/thermal_zone0/temp ';
    }

    // exec command
    const lsx = execSync(cmd);

    // evaluate cli response depending on platform
    if (this.platform == 'darwin') {
      temp = lsx.toString('UTF8').split(': ')[1].trim();
    } else if (this.platform == 'linux') {
      temp = Math.round(lsx.toString('UTF8') / 10) / 100;
    }

    // return temperature
    return { temp };
  }

  /**
    * write data to influx database
    */
  write2InfluxDB = async (influxdb, data) => {
    const org = process.env.INFLUXBD_CLOUD_ORGANIZATION;
    const bucket = process.env.INFLUXBD_CLOUD_BUCKET;

    const writeApi = influxdb.getWriteApi(org, bucket);

    // temperature
    writeApi.writePoint(new Point('temp').floatField('cpu-temperature', data.temp));

    writeApi.close()
      .catch(e => {
        console.error(e);
        console.log('Finished ERROR');
      });
  }

  async monitor() {
    const data = await this.temperature();
    console.log(`monitoring Temperature ${data.temp}°C`);
    this.write2InfluxDB(this.influxdb, data);
  }

}

module.exports = RaspiTempMonitor;