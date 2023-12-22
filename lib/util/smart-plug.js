/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
// import Crypto from 'crypto';
// const { crypto } = Crypto;
import crypto from 'crypto';
import axios from 'axios';

export class MerossSmartPlug {
  constructor(host, key, opts = {}) {
    this.key = key;
    this.host = host;
    this.opts = opts;
  }

  sendRequest(method, namespace, payload) {
    const timestamp = Math.floor(Date.now() / 1000);
    const messageId = crypto.createHash('md5').update(`${timestamp}`).digest('hex');
    const signKey = crypto.createHash('md5').update(messageId + this.key + timestamp).digest('hex');

    return axios.post(`http://${this.host}/config`, {
      header: {
        messageId,
        method,
        from: `http://${this.host}/config`,
        sign: signKey,
        namespace,
        timestamp,
        payloadVersion: 1,
      },
      payload,
    });
  }

  async getState() {
    return (await this.sendRequest('GET', 'Appliance.System.All', {})).data.payload;
  }

  async getAbilities() {
    return (await this.sendRequest('GET', 'Appliance.System.Ability', {})).data.payload.ability;
  }

  async getElectricity() {
    return (await this.sendRequest('GET', 'Appliance.Control.Electricity', {})).data.payload.electricity;
  }

  async getWifiList() {
    return (await this.sendRequest('GET', 'Appliance.Config.WifiList', {})).data;
  }

  async isOnline() {
    return (await this.sendRequest('GET', 'Appliance.System.Online', {})).data.payload.online.status === 1;
  }

  async getPower(channel = 0) {
    return (await this.getState()).all.digest.togglex[channel].onoff === 1;
  }

  async setPower(power, channel = 0) {
    const resp = await this.sendRequest('SET', 'Appliance.Control.ToggleX', {
      togglex: {
        onoff: power ? 1 : 0,
        channel,
      },
    });

    return resp.data;
  }

  async turnOn(channel = 0) {
    return this.setPower(true, channel);
  }

  async turnOff(channel = 0) {
    return this.setPower(false, channel);
  }
}
