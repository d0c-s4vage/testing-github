import { DEvents, DEventParsed } from '@/lib/workers/types';

import { UuidHaver } from './bases';
import type { Uuid } from './bases';
import { Proposition } from './propositions';

export type KnockItOutState = {
  items: Item[];
};

export class Item extends UuidHaver {
  name: string;
  description: string;
  completed: boolean;

  constructor(name: string = "", description: string = "", completed: boolean = false) {
    super();
    this.name = name;
    this.description = description;
    this.completed = completed;
  }
};

export class DecisionEdge extends UuidHaver {
  fromDecision: Uuid;
  toDecision: Uuid
  proposition: Proposition;

  // should use a templating language when defining these - fields in DEvents
  // should be resolved first?
  //
  // also - if the outputEvents are empty, then the same event is simply carried
  // forward.
  outputEvents: DEventParsed[];

  constructor(fromDecision: Uuid, toDecision: Uuid, proposition: Proposition, events: DEventParsed[]) {
    super();
    this.fromDecision = fromDecision;
    this.toDecision = toDecision;
    this.proposition = proposition;
    this.outputEvents = events;
  }
};

export class Decision extends UuidHaver {
  name: string;
  description: string;
  inputEventType: DEvents;
  //childEdges: DecisionEdge[];

  constructor(name: string = "", description: string = "", inputEventType: DEvents) {
    super();
    this.name = name;
    this.description = description;
    this.inputEventType = inputEventType;
    //this.childEdges = [];
  }
};
