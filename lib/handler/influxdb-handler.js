/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-console */
const { InfluxDBClient, Point } = require('@influxdata/influxdb3-client');

const bucket = process.env.INFLUXBD_CLOUD_BUCKET; // database
const token = process.env.INFLUXBD_CLOUD_TOKEN;
const influxDBUrl = process.env.INFLUXBD_CLOUD_HOST; // url
const host = process.env.HOST || 'localhost'; // tag value

class InfluxDBHandler {
  constructor() {
    console.log('InfluxDB Handler initialized');

    if (!influxDBUrl || !token) {
      throw new Error('INFLUXBD_CLOUD_HOST and INFLUXBD_CLOUD_TOKEN environment variables are required.');
    }
    this.influxdbClient = new InfluxDBClient({ host: influxDBUrl, token });
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
  send(dataPoints) {
    if (!Array.isArray(dataPoints)) {
      throw new Error('Data must be an array.');
    }

    dataPoints.forEach((dataPoint) => {
      if (!dataPoint.hasOwnProperty('name') || !dataPoint.hasOwnProperty('topic')
          || !dataPoint.hasOwnProperty('type') || !dataPoint.hasOwnProperty('value')) {
        console.warn('Skipping data point due to missing properties.');
        return;
      }

      const p = new Point(bucket).tag('host', host);
      if (dataPoint.type === 'int') {
        p.intField(dataPoint.name, dataPoint.value);
      } else if (dataPoint.type === 'float') {
        p.floatField(dataPoint.name, dataPoint.value);
      } else {
        console.warn(`Skipping data point due to unknown type: ${dataPoint.type}`);
      }

      this.influxdbClient.write(p, bucket).catch((err) => console.error(err));
      // console.log(JSON.stringify(p), bucket, host);
    });
  }
}

module.exports = InfluxDBHandler;
