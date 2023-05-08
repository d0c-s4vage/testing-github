import { Item, KnockItOutState, DecisionTree, DecisionTreeData, ItemData, KnockItOutStateData } from '@/models/all';
import {Uuid} from '@/models/bases';

export enum DEvents {
  None = "none",

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

export abstract class DEventBase<EventType extends DEvents> {
  type: EventType;
  category: string;
  action: string;

  constructor(type: EventType) {
    [this.category, this.action] = type.split(":", 2);
    this.type = type;
  }
};

export class DNoneEvent extends DEventBase<DEvents.None> {
  constructor() {
    super(DEvents.None);
  }
}

export class DItemNewEvent extends DEventBase<DEvents.ItemNew> {
  data: ItemData;

  constructor(item: Item) {
    super(DEvents.ItemNew);
    this.data = item;
  }
};

export class DItemEditEvent extends DEventBase<DEvents.ItemEdit> {
  data: ItemData;

  constructor(item: Item) {
    super(DEvents.ItemEdit);
    this.data = item;
  }
};

export class DItemDeleteEvent extends DEventBase<DEvents.ItemDelete> {
  data: {uuid: string};

  constructor(uuid: Uuid) {
    super(DEvents.ItemDelete);
    this.data = { uuid };
  }
};

// ------------------------

export class DDecisionNewEvent extends DEventBase<DEvents.DecisionNew> {
  data: DecisionTreeData;

  constructor(decision: DecisionTree<Extract<DEvents,DEvents>,Extract<DEvents,DEvents>>) {
    super(DEvents.DecisionNew);
    this.data = decision;
  }
};

export class DDecisionEditEvent extends DEventBase<DEvents.DecisionEdit> {
  data: DecisionTreeData;

  constructor(decision: DecisionTree<Extract<DEvents,DEvents>,Extract<DEvents,DEvents>>) {
    super(DEvents.DecisionEdit);
    this.data = decision;
  }
};

export class DDecisionDeleteEvent extends DEventBase<DEvents.DecisionDelete> {
  data: Uuid;

  constructor(uuid: Uuid) {
    super(DEvents.DecisionDelete);
    this.data = uuid;
  }
};

// ------------------------

export class DStateFetchEvent extends DEventBase<DEvents.StateFetch> {
  data: undefined;

  constructor() {
    super(DEvents.StateFetch);
  }
};

export class DStateReloadEvent extends DEventBase<DEvents.StateReload> {
  data: KnockItOutStateData;

  constructor(state: KnockItOutState) {
    super(DEvents.StateReload);
    this.data = state;
  }
};
