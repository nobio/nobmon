/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
/* eslint-disable max-len */
import mqtt from 'mqtt';

const {
  MQTT_CLIENT_URI,
  MQTT_CLIENT_USER,
  MQTT_CLIENT_PASSWORD,
} = process.env;

export class MQTTHander {
  // optional parameters; easy to test this way
  constructor(mqttUri = MQTT_CLIENT_URI, mqttUser = MQTT_CLIENT_USER, mqttPassword = MQTT_CLIENT_PASSWORD) {
    console.log('MQTT Handler initialized');
    console.log(`MQTT URI=${MQTT_CLIENT_URI}`);
    console.log(`MQTT User=${MQTT_CLIENT_USER}`);

    this.mqttUri = mqttUri;
    this.mqttUser = mqttUser;
    this.mqttPassword = mqttPassword;

    this.isConnecting = false;
    // this.connectToMqttServer();
  }

  connectToMqttServer() {
    if (this.isConnecting === true) return;
    this.isConnecting = true;

    const options = {
      clientId: `nobmon_${Math.random().toString(16).substr(2, 8)}`,
      keepalive: 60,
      username: this.mqttUser,
      password: this.mqttPassword,
    };
    console.log(`Connecting to MQTT host ${this.mqttUri}...`);
    this.mqttClient = mqtt.connect(this.mqttUri, options);

    // event handler of mqtt client
    this.mqttClient.on('error', (error) => {
      console.error(`Error connecting to MQTT host: ${error}`);
    });

    this.mqttClient.on('connect', () => {
      console.log(`Connection to MQTT host ${this.mqttUri} successful!`);
    });

    this.mqttClient.on('offline', () => {
      console.warn('MQTT client is offline. Attempting to reconnect...');
      this.connectToMqttServer();
    });
  }

  send(data) {
    if ((this.mqttClient === undefined || !this.mqttClient.connected) && this.isConnecting !== true) {
      console.warn('MQTT client is not connected. Attempting to reconnect...');
      this.connectToMqttServer();
      return;
    }

    data.forEach((d) => {
      this.mqttClient.publish(`nobmon/${d.topic}/${d.name}`, JSON.stringify(d));
    });
  }
}
