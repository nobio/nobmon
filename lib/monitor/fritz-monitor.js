/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
import { execSync } from 'child_process';
import xml2js from 'xml2js';

export class FritzboxMonitor {
  xml2jsonParser = new xml2js.Parser(/* options */);

  constructor(handlers) {
    console.log('FritzBox Bandwidth Monitoring');
    this.handlers = handlers;

    // constants
    this.FRITZ_DELAY = process.env.FRITZ_DELAY;
    this.FRITZ_COMMON_CYCLE = process.env.FRITZ_COMMON_CYCLE;
    this.CURL_TIMEOUT = 5;

    // variables
    this.commonCounter = 0;
    this.maxDownload = 0;
    this.maxUpload = 0;

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
    }, this.FRITZ_DELAY * 1000);
  };

  getCurrentRates = async () => {
    const VERB = 'GetAddonInfos';
    const URL = 'WANCommonIFC1';
    const NS = 'WANCommonInterfaceConfig';

    try {
      const xml = execSync(`curl --max-time ${this.CURL_TIMEOUT} http://fritz.box:49000/igdupnp/control/${URL} \
                -H "Content-Type: text/xml; charset=utf-8" \
                -H "SoapAction:urn:schemas-upnp-org:service:${NS}:1#${VERB}" \
                -d "<?xml version='1.0' encoding='utf-8'?> <s:Envelope s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/' xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'> <s:Body> <u:${VERB} xmlns:u=\"urn:schemas-upnp-org:service:${NS}:1\" /> </s:Body> </s:Envelope>" \
                -s`).toString();
      const json = await this.xml2jsonParser.parseStringPromise(xml);
      // console.log(JSON.stringify(json, null, 2));
      return json['s:Envelope']['s:Body'][0]['u:GetAddonInfosResponse'][0];
    } catch (error) {
      console.error('{"Connection":"ERROR - Could not retrieve status from FRITZ!Box"}');
      console.error(error);
    }
  };

  getCommonInfo = async () => {
    const VERB = 'GetCommonLinkProperties';
    const URL = 'WANCommonIFC1';
    const NS = 'WANCommonInterfaceConfig';

    try {
      const xml = execSync(`curl --max-time ${this.CURL_TIMEOUT} http://fritz.box:49000/igdupnp/control/${URL} \
                -H "Content-Type: text/xml; charset=utf-8" \
                -H "SoapAction:urn:schemas-upnp-org:service:${NS}:1#${VERB}" \
                -d "<?xml version='1.0' encoding='utf-8'?> <s:Envelope s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/' xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'> <s:Body> <u:${VERB} xmlns:u=\"urn:schemas-upnp-org:service:${NS}:1\" /> </s:Body> </s:Envelope>" \
                -s`).toString();
      const json = await this.xml2jsonParser.parseStringPromise(xml);
      // console.log(JSON.stringify(json, null, 2));
      return json['s:Envelope']['s:Body'][0]['u:GetCommonLinkPropertiesResponse'][0];
    } catch (error) {
      console.error('{"Connection":"ERROR - Could not retrieve status from FRITZ!Box"}');
      console.error(error);
    }
  };

  sendRequest = async () => {
    // only get the common data only once every FRITZ_COMMON_CYCLE cycles
    if (this.commonCounter % this.FRITZ_COMMON_CYCLE === 0) {
      console.log(`${new Date().toLocaleString()} | monitoring Fritzbox updating common`);
      this.commonCounter = 0;
      const commonJson = await this.getCommonInfo();

      this.maxDownload = commonJson.NewLayer1DownstreamMaxBitRate[0];
      this.maxUpload = commonJson.NewLayer1UpstreamMaxBitRate[0];
    }
    this.commonCounter += 1; // increase counter

    const currentRates = await this.getCurrentRates();
    const resp = {
      downloadRate: currentRates.NewByteReceiveRate[0] * 8 / 1000000,
      uploadRate: currentRates.NewByteSendRate[0] * 8 / 1000000,
      downloadTotal: currentRates.NewTotalBytesReceived[0] * 8 / 1000000,
      uploadTotal: currentRates.NewTotalBytesSent[0] * 8 / 1000000,
      downloadMax: this.maxDownload / 1000000,
      uploadMax: this.maxUpload / 1000000,
    };

    return resp;
  };

  async monitor() {
    try {
      const usage = await this.sendRequest();
      const data = [];
      data.push({
        name: 'upstreamRate', topic: 'bndw', type: 'int', value: usage.uploadRate,
      });
      data.push({
        name: 'downstreamRate', topic: 'bndw', type: 'int', value: usage.downloadRate,
      });
      data.push({
        name: 'upstreamTotal', topic: 'bndw', type: 'int', value: usage.uploadTotal,
      });
      data.push({
        name: 'downstreamTotal', topic: 'bndw', type: 'int', value: usage.downloadTotal,
      });
      data.push({
        name: 'upstreamMax', topic: 'bndw', type: 'int', value: usage.uploadMax,
      });
      data.push({
        name: 'downstreamMax', topic: 'bndw', type: 'int', value: usage.downloadMax,
      });

      const factUp = Math.round(1000 * ((usage.uploadRate) / usage.downloadMax)) / 10;
      const factDown = Math.round(1000 * ((usage.downloadRate) / usage.downloadMax)) / 10;

      console.log(`${new Date().toLocaleString()} | monitoring Fritzbox Up: ${usage.uploadRate} (${factUp}%) Down: ${usage.downloadRate} (${factDown}%)`);

      this.handlers.forEach((handler) => {
        handler.send(data);
      });
    } catch (error) {
      console.error(error);
    }
  }
}
