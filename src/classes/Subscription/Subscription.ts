import { DocumentNode, getOperationAST } from "graphql";
import * as path from "path";
import { Operation } from 'apollo-link';

/*
    room = account
    action = entity + action (CREATE, UPDATE, DELETE)
*/

export abstract class Subscription {

  protected abstract get path(): string;

  get id(): string {
    return path.join(this.room/*, this.user*/, this.path);
  }

  room: string;

  // user: string;
}

/*
    summury path = account/user/action
*/

export class EntitySubscription extends Subscription {

  protected get path(): string {
    return path.join(this.action, this.hash);
  }

  action: string;
  hash: string;
}
