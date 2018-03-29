import { IClientSubscribeOptions } from 'mqtt';
import * as aws from "aws-sdk";
import { CloudConnectCredentials } from "../types";

export interface IConnectOptionsResolver {

    /* async */ resolve(token: string): Promise<aws.Credentials>;
}

export interface IMqttClient {

    /* async */ connect(credentials: CloudConnectCredentials, onReceive: Function, onClose: Function): void;

    /* async */ subscribe(topic: string, options: IClientSubscribeOptions): Promise<any>;

    unsubscribe(topic: string): void;
}