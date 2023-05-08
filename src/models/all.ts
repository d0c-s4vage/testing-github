import Context from '@/lib/workers/context';
import { DEvents, DEventBase } from '@/lib/workers/types';
import {Action, ActionData, LoadAction} from './actions';

import { TrackedObject, TrackedObjectData } from './bases';

import { LoadProposition, Proposition, PropositionData } from './propositions';

export interface KnockItOutStateData {
  items: ItemData[];
};
export class KnockItOutState {
  items: Item[];

  constructor(items?: Item[]) {
    this.items = items || [];
  }

  toObj(): KnockItOutStateData {
    return {
      items: this.items.map((i) => i.toObj()),
    };
  }

  static fromObj(data: KnockItOutStateData) : KnockItOutState {
    const items = data.items.map((i) => Item.fromObj(i));
    const res = new KnockItOutState();
    Object.assign(res, data);
    res.items = items;
    return res;
  }
};

// ----------------------------------------------------------------------------

export interface ItemData extends TrackedObjectData {
  name: string,
  description: string,
  completed: boolean,
};
export class Item extends TrackedObject {
  name: string;
  description: string;
  completed: boolean;

  constructor(name?: string, description?: string, completed?: boolean) {
    super();
    this.name = name || "";
    this.description = description || "";
    this.completed = completed === undefined ? false : completed;
  }

  toObj(): ItemData {
    return {
      uuid: this.uuid,
      name: this.name,
      description: this.description,
      completed: this.completed,
    };
  }

  static fromObj(data: ItemData): Item {
    const res = new Item();
    Object.assign(res, data);
    return res;
  }
};

// ----------------------------------------------------------------------------

export interface EventEdgeData extends TrackedObjectData {
  uuid: string;
  proposition: PropositionData;
  action: ActionData;
};

export class EventEdge
  <
    InputEvent extends DEvents,
    OutputEvent extends DEvents,
  >
  extends TrackedObject
{
  proposition: Proposition;
  action: Action<InputEvent, OutputEvent>;

  constructor(proposition: Proposition, action: Action<InputEvent, OutputEvent>) {
    super();
    this.proposition = proposition;
    this.action = action;
  }

  toObj(): EventEdgeData {
    return {
      uuid: this.uuid,
      proposition: this.proposition.toObj(),
      // fast way to serialize it
      action: Object.assign({}, this.action),
    };
  }

  static fromObj(data: EventEdgeData) {
    const proposition = LoadProposition(data.proposition);
    const action = LoadAction(data.action);

    return new EventEdge(proposition, action);
  }

  canTraverse(ctx: Context): boolean {
    let currEvent = ctx.currEvent;
    if (!this.action.supportedEvents.includes(currEvent.type)) {
      return false;
    }
    if (!this.proposition.canEvaluate(ctx)) {
      return false;
    }
    return true;
  }

  traverse(ctx: Context): DEventBase<OutputEvent> | null {
    if (!this.canTraverse(ctx)) {
      throw new Error("Can't traverse edge");
    }
    if (!this.proposition.canEvaluate(ctx)) {
      throw new Error("Can't traverse edge (prop can't eval)");
    }
    if (!this.proposition.evaluate(ctx)) {
      return null;
    }
    return this.action.run(ctx.currEvent, ctx);
  }
};

// ----------------------------------------------------------------------------

export type DecisionTreeOpts
  <
    InputEvent extends DEvents,
    OutputEvent extends DEvents,
  > = {
  name: string,
  description: string,
  edges: EventEdge<InputEvent, OutputEvent>[],
  events: InputEvent[];
};

export interface DecisionTreeData extends TrackedObjectData {
  name: string;
  description: string;
  edges: EventEdgeData[];
  events: DEvents[];
};

export class DecisionTree
  <
    InputEvent extends DEvents,
    OutputEvent extends DEvents,
  >
  extends TrackedObject
{
  name: string;
  description: string;
  edges: EventEdge<InputEvent, OutputEvent>[];
  events: InputEvent[]; 

  constructor({name, description, edges, events}: DecisionTreeOpts<InputEvent, OutputEvent>) {
    super();
    this.name = name;
    this.description = description;
    this.edges = edges;
    this.events = events;
  }

  canEvaluate(ctx: Context): boolean {
    return this.events.includes(ctx.currFrame.event.type);
  }

  evaluate(ctx: Context): DEventBase<OutputEvent>[] {
    let newEvents = [];
    for (const edge of this.edges) {
      if (!edge.canTraverse(ctx)) {
        continue;
      }

      let res = edge.traverse(ctx);
      if (res !== null) {
        newEvents.push(res);
      }
    }
    return newEvents;
  }

  toObj(): DecisionTreeData {
    return {
      uuid: this.uuid,
      name: this.name,
      description: this.description,
      events: this.events,
      edges: this.edges.map((e) => e.toObj()),
    };
  }

  static fromObj(data: DecisionTreeData) {
    const edges = data.edges.map((e) => EventEdge.fromObj(e));
    return new DecisionTree({
      name: data.name,
      description: data.description,
      events: data.events,
      edges: edges,
    });
  }
};
