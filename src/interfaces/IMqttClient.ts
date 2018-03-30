import { IClientSubscribeOptions } from 'mqtt';
import * as aws from "aws-sdk";
import { CloudConnectCredentials } from "../types";

export interface IConnectOptionsResolver {

    /* async */ resolve(): Promise<aws.Credentials>;
}

export interface IMqttClient {

    /* async */ connect(credentials: CloudConnectCredentials, onReceive: Function, onClose: Function, onConnected: Function): Promise<void>;

    /* async */ subscribe(topic: string, options: IClientSubscribeOptions): Promise<boolean>;

    unsubscribe(topic: string): void;
}