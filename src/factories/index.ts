import {
    SubscriptionCloudClient,
    SubscriptionClientLink,
    IotMqttClient,
    CognitoConnectionResolver
} from "../classes";
import {
    IMqttClient,
    IConnectOptionsResolver
} from '../interfaces';

import {
    CognitoConnectionOptions,
    IotMqttConnectionOpertions
} from "../types";

export namespace SubscriptionEnvironment {

    export namespace Transport {

        export function Iot(options: IotMqttConnectionOpertions): IMqttClient {
            return new IotMqttClient(options);
        }
    }

    export namespace Auth {
        export function Cognito(options: CognitoConnectionOptions): IConnectOptionsResolver {
            return new CognitoConnectionResolver(options);
        }
    }

    export type ClientInput = { transport: IMqttClient, resolver: IConnectOptionsResolver };

    export function CloudClient(input: ClientInput): SubscriptionCloudClient {
        return new SubscriptionCloudClient(input.resolver, input.transport);
    }

    export function ClientApolloLink(client: SubscriptionCloudClient): SubscriptionClientLink {
        return new SubscriptionClientLink(client);
    }
}