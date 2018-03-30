import { DocumentNode, getOperationAST, InlineFragmentNode, FieldNode, FragmentSpreadNode, OperationDefinitionNode } from "graphql";
import { Operation } from 'apollo-link';
import { EntitySubscription, Subscription } from './Subscription';
const sha256 = require("sha256");
const graphqlFields = require("graphql-fields");


export namespace Specific {

  /*
    SubscriptionFromOperation and getIdToken specific functions. Should be generalize
    conver operation to subscription struct
    account-id => room
    action => sha256 from query string
  */

  export function SubscriptionFromOperation(operation: Operation): Subscription {

    const room = operation.getContext()["headers"]["account-id"];

    const selection = getSelection(getOperationAST(operation.query));

    let subscription = new EntitySubscription();
    subscription.room = room;
    subscription.action = getNameFromSelection(selection);
    subscription.hash = sha256(JSON.stringify(selection));
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

function getNameFromSelection(node: FieldNode | FragmentSpreadNode | InlineFragmentNode): string {
  if (node.kind === "InlineFragment") {
    throw new Error("unsupported kind of selections");
  }
  return node.name.value;
}

function getSelection(node: OperationDefinitionNode) {
  const selections = node.selectionSet.selections;
  if (selections.length > 1) {
    console.warn("Only first subscription will be activated.");
  }
  return selections[0];
}