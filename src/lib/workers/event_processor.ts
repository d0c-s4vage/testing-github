import Context from './context';
import { Item, Decision, KnockItOutState } from '@/models/all';
import { DEvents, DEventRaw, DItemEvent, DDecisionEvent, DStateEvent, DEventParsed } from './types';
import state from './state';

export type EventHandlers = {
  itemHandler?: (event: DItemEvent, ctx: Context) => DEventParsed[];
  stateHandler?: (event: DStateEvent, ctx: Context) => DEventParsed[];
  decisionHandler?: (event: DDecisionEvent, ctx: Context) => DEventParsed[];
};

export class EventProcessor {
  handlers: EventHandlers;
  canSave: boolean;

  constructor(handlers: EventHandlers, canSave: boolean = true) {
    this.handlers = handlers;
    this.canSave = canSave;
  }

  private log(msg: string) {
    console.log(
      (this.canSave ? "WORKER": "UI")
      + ": "
      + msg
    );
  }

  process(event: DItemEvent | DStateEvent | DDecisionEvent, _ctx: Context | null = null) {
    let ctx = _ctx || new Context();
    ctx.incLevel();

    this.log(`processing event: ${event.category}:${event.action}`);

    switch (event.category) {
      case "item":
        if (!this.handlers.itemHandler) { return; }
        this.handlers.itemHandler(event as DItemEvent, ctx);
        break;
      case "state":
        if (!this.handlers.stateHandler) { return; }
        this.handlers.stateHandler(event as DStateEvent, ctx);
        break;
      case "decision":
        if (!this.handlers.decisionHandler) { return; }
        this.handlers.decisionHandler(event as DDecisionEvent, ctx);
        break;
      default:
        throw new Error(`Unsupported event category ${event.category}`);
    }

    ctx.decLevel();

    if (ctx.level == 0 && this.canSave && ctx.shouldSave) {
      state.save().then(() => {
        state.get().then((stateVal) => {
          self.postMessage(new DStateEvent(DEvents.StateReload, stateVal));
        });
      });
    }
  }

  processRaw(rawEvent: DEventRaw) {
    this.log("processing raw event: " + JSON.stringify(rawEvent));
    switch (rawEvent.category) {
      case "item":
        const itemEvent = new DItemEvent(rawEvent.type, rawEvent.data as Item);
        this.process(itemEvent);
        break;
      case "decision":
        const decisionEvent = new DDecisionEvent(rawEvent.type, rawEvent.data as Decision);
        this.process(decisionEvent);
        break;
      case "state":
        const stateEvent = new DStateEvent(rawEvent.type, rawEvent.data as (KnockItOutState | null));
        this.process(stateEvent);
        break;
      default:
        throw new Error(`Unsupported raw event category ${rawEvent.category}`);
    }
  }
}
