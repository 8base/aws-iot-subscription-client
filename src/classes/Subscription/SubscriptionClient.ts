
import { ApolloLink, Operation, NextLink, FetchResult, Observable } from "apollo-link";
import { IMqttClient, IConnectOptionsResolver } from "../../interfaces";
import { Subscription } from "./Subscription";
import { IClientSubscribeOptions } from 'mqtt';
// import { SubscriptionObservable } from "./SubscriptionObservable";
import { MqttConnectOptions } from "../../types";


enum ClientStatus {
    Offline, Connected, Connecting
}

/*
    Class connect to subscription transport by mqtt protocol and receive data
*/
type observer = {next: Function, error: Function, complete: Function };

export class SubscriptionClient {

    private mqttClient: IMqttClient;

    /*
        Observable per topic
    */

    private observersSink: { [key: string]: observer[] } = {};

    private status: ClientStatus = ClientStatus.Offline;

    private subscriptionQueue: { subscription: Subscription,  observer: observer } [] = [];

    constructor(client: IMqttClient) {
        this.mqttClient = client;
    }

    connect(options: MqttConnectOptions) {
        this.status = ClientStatus.Connecting;

        this.mqttClient.connect(options,
            this.onReceive.bind(this),
            this.onClose.bind(this),
            this.onConnect.bind(this));
    }

    get isConnected(): boolean {
        return this.status !== ClientStatus.Offline;
    }

    subscribe(subscription: Subscription, observer: observer) {

        if (this.status !== ClientStatus.Connected) {
            return this.subscriptionQueue.push( { subscription, observer });
        }

        this.subscribeInternal(subscription, observer);
    }

    /*
        Private functions
    */

    private onReceive(action: string, data: any) {
        const resp = this.processResponce(data);
        const observers = this.observersSink[action];
        if (resp && observers) {
            observers.map(observer => observer.next(resp));
        }
    }

    private onClose(err: Error) {
        for( const action in this.observersSink) {
            this.observersSink[action].map(observer => err ? observer.error(err) : observer.complete());
        }
        this.status = ClientStatus.Offline;
    }

    private onConnect() {
        this.status = ClientStatus.Connected;
        this.subscriptionQueue.map(s => this.subscribeInternal(s.subscription, s.observer) );
        this.subscriptionQueue = [];
    }

    private processResponce(data: any) {
        try {
            return JSON.parse(String(data));
        } catch(ex) {
            console.log("input data " + data + " is not json format");
        }
        return null;
    }

    private subscribeInternal(subscription: Subscription, observer: observer) {
        this.subscribeMqtt(subscription);
        this.addObserver(subscription, observer);
    }

    private subscribeMqtt(subscription: Subscription) {
        this.mqttClient.subscribe(subscription.id, { qos: 1 });
    }

    private addObserver(subscription: Subscription, observer: observer) {
        if (!this.observersSink[subscription.id]) {
            this.observersSink[subscription.id] = [];
        }

        this.observersSink[subscription.id].push(observer);
    }
}