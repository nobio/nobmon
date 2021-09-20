const Fritzbox = require('fritznode');
const { Point } = require('@influxdata/influxdb-client')

class FritzboxMonitor {

  isFritzboxConnecting = false;

  constructor(influxdb) {
    this.influxdb = influxdb;
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
        conInflux = await connectInfluxDB();
        console.log(`reconnecting influxdb...`);
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

  /**
   * calculate bandwidth from fritz box data
   * 
   * upCurrent:   current upstream in MBit
   * downCurrent: current downstream in MBit
   * factUp:      procentage value of upstream over max upstream
   * factDown:    procentage value of downstream over max downstream
   */
  bandwith = async (con) => {
    const usage = await con.getBandwithUsage();
    usage.up = usage.upCurrent / 1024 / 1024;
    usage.down = usage.downCurrent / 1024 / 1024;
    usage.factUp = Math.round(1000 * ((usage.upCurrent) / usage.upMax)) / 10;
    usage.factDown = Math.round(1000 * ((usage.downCurrent) / usage.downMax)) / 10;

    return usage;
  }

  /**
  * write data to influx database
  */
  write2InfluxDB = async (influxdb, data) => {
    const org = process.env.INFLUXBD_CLOUD_ORGANIZATION;
    const bucket = process.env.INFLUXBD_CLOUD_BUCKET;

    const writeApi = influxdb.getWriteApi(org, bucket);
    writeApi.useDefaultTags({ bandwith: 'bandwidth' });

    // bandwidth
    writeApi.writePoint(new Point('bndw').intField('upstream_current', data.upCurrent));
    writeApi.writePoint(new Point('bndw').intField('downstream_current', data.downCurrent));
    writeApi.writePoint(new Point('bndw').floatField('upstream_mbit', data.up));
    writeApi.writePoint(new Point('bndw').floatField('downstream_mbit', data.down));

    // max values
    writeApi.writePoint(new Point('max').floatField('downstream_max', data.downMax));
    writeApi.writePoint(new Point('max').floatField('upstream_max', data.upMax));

    writeApi.close()
      .catch(e => {
        console.error(e);
        console.log('Finished ERROR');
      });
  }

  async monitor() {
    try {
      if (this.conFritz) {
        const usage = await this.bandwith(this.conFritz);
        console.log(`monitoring Fritzbox Up: ${usage.factUp}% Down: ${usage.factDown}%`);
        await this.write2InfluxDB(this.influxdb, usage);
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