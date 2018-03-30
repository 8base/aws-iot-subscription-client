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
            this.client.connect();
        }

        forwardedLink(operation).subscribe({
            next: (result: any) => {
                console.log(result);
            },
            complete: () => {
                console.log("complete");
            },
            error: (err: Error) => {
                console.log(err);
            }
        });

        return this.client.subscribe(Specific.SubscriptionFromOperation(operation));
    }



    request1(operation: Operation, forward: NextLink) {
        return new Observable(observer => {

          const promises: Promise<any>[] = [];

          const handleFile = (variables: Record<string, any>, fieldName: string | number) => {
            const file = variables[fieldName];

            FileServer.uploadLink(file, file.meta || file.metadata, !!file.public,
              (req: GraphQLRequest) => forward(createOperation(operation.getContext(), req)),
              (error) => {
                observer.next(error);
                observer.complete();
                return;
              });

            file.upload.onstart = (data: any) => {
              if (variables) {
                variables[fieldName] = data.id;
              }
            };

            promises.push(new Promise((resolve: any, reject: any) => {
              file.request.ontimeout = (err: any) => reject(err);
              file.request.onabort = (err: any) => reject(err);
              file.request.onerror = (err: any) => reject(err);
              file.request.onload = () => resolve();
              return;
            }));
          };

          mutateOperationVariables(operation.variables || {}, handleFile);

          Promise.all(promises).then(() => {
            forward(operation).subscribe({
              error: (error: any) => {
                observer.error(error);
              },
              next: observer.next.bind(observer),
              complete: () => observer.complete()
            });
          }).catch((err) => {
            observer.error(err);
          });

        });
      }


}

