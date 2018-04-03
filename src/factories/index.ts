import {
    SubscriptionClientLink,
    SubscriptionClient,
    SubscriptionFromOperation
} from "../classes";


export namespace SubscriptionEnvironment {

    export function ApolloLink(): SubscriptionClientLink {
        return new SubscriptionClientLink();
    }

    export namespace Utils {
        export const ConstructSubscription = (account: string, action: string) => {
            return SubscriptionFromOperation(action, account, null);
        };
    }
}




