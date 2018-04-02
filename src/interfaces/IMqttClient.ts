import { IClientSubscribeOptions } from 'mqtt';
import { MqttConnectOptions } from "../types";

export interface IConnectOptionsResolver {

    /* async */ resolve(): Promise<MqttConnectOptions>;
}

export interface IMqttClient {

    /* async */ connect(options: MqttConnectOptions, onReceive: Function, onClose: Function, onConnect: Function): void;

    /* async */ subscribe(topic: string, options: IClientSubscribeOptions): Promise<any>;

    unsubscribe(topic: string): void;
}