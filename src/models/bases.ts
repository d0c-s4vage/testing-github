import {isFunctionLike} from "typescript";

export type Uuid = string;

export interface TrackedObjectData {
  uuid: Uuid;
};
export abstract class TrackedObject {
  uuid: Uuid;

  constructor() {
    this.uuid = crypto.randomUUID();
  }
}


export class Serializable<T> {
  loadObj(data: {[key in keyof T]: T[key]}): this {
    Object.assign(this, data);
    return this;
  }
};
