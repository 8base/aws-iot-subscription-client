import { IMqttClient } from '../../interfaces';
import { IClientSubscribeOptions } from 'mqtt';
import * as DeviceSdk from 'aws-iot-device-sdk';
import * as uuid from "uuid";
import { IotMqttConnectionOpertions, CloudConnectCredentials } from "../../types";

export class IotMqttClient implements IMqttClient {

    private onReceive: Function = () => {};
    private onClose: Function = () => {};
    private client: DeviceSdk.device;

    private options: IotMqttConnectionOpertions;

    constructor(options: IotMqttConnectionOpertions) {
        this.options = options;

        this.client = new DeviceSdk.device({
            region: this.options.region,
            host: this.options.iotEndpoint,
            clientId: uuid.v4(),
            protocol: 'wss',
            accessKeyId: '',
            secretKey:  '',
            sessionToken: '',
            debug: this.options.debug
        })
        .on("error", () => {
            // skip
        });

        this.client.on("message", (topic: string, payload: any) => {
            this.onReceive(topic, payload);
        });

        this.client.on("offline", () => {
            this.onClose();
        });

        this.client.on("close", () => {
            this.onClose();
        });

        this.client.on("error", (err: Error) => {
            this.onClose();
        });

    }

    connect(credentials: CloudConnectCredentials, onReceive: Function, onClose: Function) {

        this.onReceive = onReceive;
        this.onClose = onClose;

        this.client.updateWebSocketCredentials(credentials.accessKeyId, credentials.secretAccessKey, credentials.sessionToken, null);
    }

    async subscribe(topic: string, options: IClientSubscribeOptions): Promise<any> {

        return new Promise((resolve, reject) => {
            this.client.subscribe(topic,
                {
                    qos: options.qos
                },
                (err: Error, data: any) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(data);
                });
        });
    }


    unsubscribe(topic: string): void {
        this.client.unsubscribe(topic);
    }
}