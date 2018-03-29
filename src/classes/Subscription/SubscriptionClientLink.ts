import { ApolloLink, NextLink, Operation, FetchResult, Observable } from "apollo-link";
import { SubscriptionCloudClient } from "./SubscriptionCloudClient";
import * as aws from "aws-sdk";
import { DocumentNode, getOperationAST } from 'graphql';
import { Specific, isASubscriptionOperation } from "./Utils";

export class SubscriptionClientLink extends ApolloLink {
    private client: SubscriptionCloudClient;

    private connected: boolean = false;

    constructor(client: SubscriptionCloudClient) {
        super();
        this.client = client;
    }

    /*
        1. If operation is not subscription => forward to the next link
        2. If subscription client is not connected => connect
        3. Forward operation to the next link. Server should process subscription data. (save in redis and so on)
        4. Subscribe on cloud subscrption client
        5. Return observable
    */
    request(operation: Operation, forwardedLink: NextLink): Observable<FetchResult> {

        if (!isASubscriptionOperation(operation.query, operation.operationName)) {
            return forwardedLink(operation);
        }

        if (!this.client.isConnected) {
            this.client.connect(Specific.getIdToken(operation));
        }

        // TODO return subscription observable after forwarded operation
        /*
            forward subscription to http link for processing on the server side. Hard.
        */
        forwardedLink(operation).subscribe({
            next: () => {},
            complete: () => { },
            error: (err: Error) => {
                console.log(err);
            }
        });

        return this.client.subscribe(Specific.SubscriptionFromOperation(operation));
    }





}

