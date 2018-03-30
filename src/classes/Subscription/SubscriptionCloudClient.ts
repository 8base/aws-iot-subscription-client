
import { ApolloLink, Operation, NextLink, FetchResult, Observable } from "apollo-link";
import { IMqttClient, IConnectOptionsResolver } from "../../interfaces";
import { Subscription } from "./Subscription";
import { IClientSubscribeOptions } from 'mqtt';
import { SubscriptionObservable } from "./SubscriptionObservable";
import { CloudConnectCredentials } from "../../types";


enum ClientStatus {
    Offline, Connected, Connecting
}

/*
    Class connect to cloud subscription transport by mqtt protocol and receive data
*/

export class SubscriptionCloudClient {

    private mqttClient: IMqttClient;

    private resolver: IConnectOptionsResolver;

    /*
        Observable per topic
    */
    private observables: Map<string, SubscriptionObservable<FetchResult>> = new Map();

    private status: ClientStatus = ClientStatus.Offline;

    private subscriptionQueue: Subscription[] = [];

    constructor(resolver: IConnectOptionsResolver, mqttClient: IMqttClient) {
        this.resolver = resolver;
        this.mqttClient = mqttClient;
    }

    connect(credentials: CloudConnectCredentials) {
        this.status = ClientStatus.Connecting;

        this.mqttClient.connect(
            credentials,
            this.onReceive.bind(this),
            this.onClose.bind(this),
            this.onConnect.bind(this)
        )
        .then(() => {
            this.subscriptionQueue.filter(async subscription =>  !! await this.connectTransport(subscription));
        })
        .catch((err: Error) => {
            this.status = ClientStatus.Offline;
            console.log(err);
        });
    }

    get isConnected(): boolean {
        return this.status !== ClientStatus.Offline;
    }

    subscribe(subscription: Subscription): Observable<FetchResult> {

        if (this.observables.has(subscription.id)) {
            return this.observables.get(subscription.id);
        }

        if (this.status !== ClientStatus.Connected) {
            this.subscriptionQueue.push(subscription);
        }

        const observable = new SubscriptionObservable<FetchResult>();
        this.observables.set(subscription.id, observable);
        return observable;
    }

    /*
        Private functions
    */

    private onReceive(topic: string, data: any) {
        const resp = this.processResponce(data);
        const observable = this.observables.get(topic);
        if (resp && observable) {
            observable.onData(resp);
        }
    }

    private onClose(reason: Error) {
        for(const [topic, observable] of this.observables) {
            observable.onError(reason);
        }
        this.status = ClientStatus.Offline;
    }

    private onConnect() {
        this.status = ClientStatus.Connected;
    }

    private processResponce(data: any) {
        try {
            return JSON.parse(String(data));
        } catch(ex) {
            console.log("input data " + data + " is not json format");
        }
        return null;
    }

    private async connectTransport(subscription: Subscription): Promise<boolean> {
        return await this.mqttClient.subscribe(subscription.id, { qos: 1 });
    }
}