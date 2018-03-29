import { DocumentNode, getOperationAST } from "graphql";
import { Operation } from 'apollo-link';
import { EntitySubscription } from './Subscription';
const sha256 = require("sha256");


export namespace Specific {

  /*
    SubscriptionFromOperation and getIdToken specific functions. Should be generalize
    conver operation to subscription struct
    account-id => room
    action => sha256 from query string
  */


  export function SubscriptionFromOperation(operation: Operation) {
    let subscription = new EntitySubscription();
    subscription.room = operation.getContext()["headers"]["account-id"];
    subscription.actionHash = sha256(JSON.stringify(operation.query));
    return subscription;
  }


  export function getIdToken(operation: Operation): string {
    return operation.getContext()["headers"]["token"];
  }
}

export function isASubscriptionOperation(document: DocumentNode, operationName: string): boolean {
  const operationAST = getOperationAST(document, operationName);
  return !!operationAST && operationAST.operation === 'subscription';
}

