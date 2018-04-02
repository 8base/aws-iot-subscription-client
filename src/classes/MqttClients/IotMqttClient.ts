import { IMqttClient } from '../../interfaces';
import { IClientSubscribeOptions } from 'mqtt';
import * as DeviceSdk from 'aws-iot-device-sdk';
import * as uuid from "uuid";
import { MqttConnectOptions } from "../../types";

export class IotMqttClient implements IMqttClient {

    private onReceive: Function = () => {};
    private onClose: Function = () => {};
    private onConnect: Function = () => {};
    private client: DeviceSdk.device;

    private debug: boolean;

    constructor(debug: boolean = false) {
        this.debug = debug;
    }

    connect(options: MqttConnectOptions, onReceive: Function, onClose: Function, onConnect: Function) {
        this.client = new DeviceSdk.device({
            region: options.region,
            host: options.iotEndpoint,
            clientId: uuid.v4(),
            protocol: 'wss',
            accessKeyId: "",
            secretKey:  "",
            sessionToken: "",
            debug: this.debug
        });

        this.onReceive = onReceive;
        this.onClose = onClose;
        this.onConnect = onConnect;

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
            this.onClose(err);
        });

        this.client.on("connect", () => {
            this.onConnect();
        });



        this.client.updateWebSocketCredentials(options.accessKeyId, options.secretKey, options.refreshToken, null);
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