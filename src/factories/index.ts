import {
    SubscriptionClientLink,
    SubscriptionClient
} from "../classes";

export namespace Subscription {

    export function ApolloLink(): SubscriptionClientLink {
        return new SubscriptionClientLink();
    }
}


