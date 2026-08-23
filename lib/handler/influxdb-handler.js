import { InfluxDB, Point } from '@influxdata/influxdb-client';

export class InfluxDBHandler {
  constructor() {
    this.INFLUXDB_CLOUD_ORGANIZATION = process.env.INFLUXDB_CLOUD_ORGANIZATION;
    this.INFLUXDB_CLOUD_BUCKET = process.env.INFLUXDB_CLOUD_BUCKET;
    this.INFLUXDB_CLOUD_TOKEN = process.env.INFLUXDB_CLOUD_TOKEN;
    this.INFLUXDB_CLOUD_HOST = process.env.INFLUXDB_CLOUD_HOST;
    this.SENDER_HOST = process.env.SENDER_HOST;

    console.log('------------------------------------------------');
    console.log('InfluxDB Handler initialized');
    console.log(`InfluxDB ORG=${this.INFLUXDB_CLOUD_ORGANIZATION}`);
    console.log(`InfluxDB BUCKET=${this.INFLUXDB_CLOUD_BUCKET}`);
    console.log(`InfluxDB INFLUX_URL=${this.INFLUXDB_CLOUD_HOST}`);
    console.log(`InfluxDB SENDER_HOST=${this.SENDER_HOST}`);

    if (!this.INFLUXDB_CLOUD_HOST || !this.INFLUXDB_CLOUD_TOKEN) {
      throw new Error('INFLUXDB_CLOUD_HOST and INFLUXDB_CLOUD_TOKEN environment variables are required.');
    }
    this.influxdb = new InfluxDB({ url: this.INFLUXDB_CLOUD_HOST, token: this.INFLUXDB_CLOUD_TOKEN });
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
    if (!Array.isArray(data)) {
      throw new Error(`Data must be an array. ${JSON.stringify(data)}`);
    }
    try {
      const writeApi = this.influxdb.getWriteApi(this.INFLUXDB_CLOUD_ORGANIZATION, this.INFLUXDB_CLOUD_BUCKET);
      writeApi.useDefaultTags({ host: this.SENDER_HOST });

      data.forEach((point) => {
        if (!point.hasOwnProperty('name') || !point.hasOwnProperty('topic')
          || !point.hasOwnProperty('type') || !point.hasOwnProperty('value')) {
          console.warn('Skipping data point due to missing properties.');
          return;
        }

        // find the right type...
        let pointToWrite;
        if (point.type === 'int') {
          pointToWrite = new Point(point.topic).intField(point.name, point.value);
        } else if (point.type === 'float') {
          pointToWrite = new Point(point.topic).floatField(point.name, point.value);
        } else {
          console.warn(`Skipping data point due to unknown type: ${point.type}`);
          return;
        }

        writeApi.writePoint(pointToWrite);
      });

      // writeApi.close().catch((e) => console.error(`Error while closing write API: ${e}`));
      writeApi.close();
    } catch (error) {
      console.error(error);
      console.error('reinit influx');
      this.influxdb = new InfluxDB({ url: this.INFLUXDB_CLOUD_HOST, token: this.INFLUXDB_CLOUD_TOKEN });
    }
  }
}
