import { Item, Decision, KnockItOutState } from '@/models/all';

export enum DEvents {
  ItemNew = "item:new",
  ItemDelete = "item:delete",
  ItemEdit = "item:edit",

  DecisionNew = "decision:new",
  DecisionDelete = "decision:delete",
  DecisionEdit = "decision:edit",

  StateFetch = "state:fetch",
  StateReload = "state:reload",
};

export class DEventRaw {
  type: DEvents;
  category: string;
  action: string;
  data: {[key: string]: any};

  constructor(type: DEvents, data: {[key: string]: any}) {
    [this.category, this.action] = type.split(":", 2);
    this.data = data;
    this.type = type;
  }
};

export abstract class DEventParsed {
  type: DEvents;
  category: string;
  action: string;

  constructor(type: DEvents) {
    [this.category, this.action] = type.split(":", 2);
    this.type = type;
  }
};

export class DItemEvent extends DEventParsed {
  data: Item;

  constructor(type: DEvents, item: Item) {
    super(type);
    this.data = item;
  }
};

export class DDecisionEvent extends DEventParsed {
  data: Decision;

  constructor(type: DEvents, decision: Decision) {
    super(type);
    this.data = decision;
  }
};

export class DStateEvent extends DEventParsed {
  data: KnockItOutState | null;

  constructor(type: DEvents, state: KnockItOutState | null = null) {
    super(type);
    this.data = state;
  }
};
