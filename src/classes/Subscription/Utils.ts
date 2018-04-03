import { DocumentNode, getOperationAST } from "graphql";
import { Operation } from 'apollo-link';
import { EntitySubscription } from '../../types';
const sha256 = require("sha256");


/*
  conver operation to subscription struct
  account => room
  action => sha256 from query string
*/

export function SubscriptionFromOperation(action: string, account: string, operation: Operation) {
  let subscription = new EntitySubscription();
  subscription.room = action;
  subscription.action = action;
  subscription.hash = sha256(JSON.stringify(operation.query));
  return subscription;
}

export function isASubscriptionOperation(document: DocumentNode, operationName: string): boolean {
  const operationAST = getOperationAST(document, operationName);
  return !!operationAST && operationAST.operation === 'subscription';
}

