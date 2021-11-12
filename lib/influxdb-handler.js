const { InfluxDB, Point, HttpError } = require('@influxdata/influxdb-client')

const org = process.env.INFLUXBD_CLOUD_ORGANIZATION;
const bucket = process.env.INFLUXBD_CLOUD_BUCKET;

const token = process.env.INFLUXBD_CLOUD_TOKEN;
const url = process.env.INFLUXBD_CLOUD_HOST

class InfluxDBHandler {

  constructor() {
    this.influxdb = new InfluxDB({ url, token });
  }

  /**
  * write data to influx database
  * 
  * 'data' type: 
  * {
  *    "name":"...",
  *    "topic":"bndw",
  *    "type":"int",
  *    "value":0.0281829833984375
  * }
  */
  send(data) {
    const writeApi = this.influxdb.getWriteApi(org, bucket);
    writeApi.useDefaultTags({ bandwith: 'bandwidth' });

    // example:     writeApi.writePoint(new Point('bndw').intField('upstream_current', data.factUp));
    data.forEach(point => {
      console.log(point)
      if (point.type == 'int') {
        writeApi.writePoint(new Point(point.topic).intField(point.name, point.value));
      } else if (point.type == 'float') {
        writeApi.writePoint(new Point(point.topic).floatField(point.name, point.value));
      }
    });

    console.log('before close')
    writeApi.close()
      .catch(e => {
        console.error(e);
        console.log('Finished ERROR');
      });
  }
}

module.exports = InfluxDBHandler;
