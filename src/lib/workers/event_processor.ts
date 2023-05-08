import Context from './context';
import { Item, KnockItOutState, DecisionTree } from '@/models/all';
import { DEventRaw, DEventBase, DStateReloadEvent, DEvents, DItemNewEvent, DItemEditEvent, DItemDeleteEvent, DDecisionNewEvent, DDecisionEditEvent, DDecisionDeleteEvent, DStateFetchEvent } from './types';
import state from './state';

export class EventProcessor {
  canSave: boolean;
  decisionTrees: DecisionTree<Extract<DEvents, DEvents>, Extract<DEvents, DEvents>>[];

  constructor(canSave: boolean = true) {
    this.canSave = canSave;
    this.decisionTrees = [];
  }

  addDecisionTree(decisionTree: DecisionTree<Extract<DEvents, DEvents>, Extract<DEvents, DEvents>>) {
    this.decisionTrees.push(decisionTree);
  }

  private log(msg: string) {
    console.log(
      (this.canSave ? "WORKER": "UI")
      + ": "
      + msg
    );
  }

  process<E extends DEventBase<Extract<DEvents, DEvents>>>(event: E, _ctx: Context | null = null) {
    let ctx = _ctx || new Context();

    ctx.enterEvent(event);
    this.log(`processing event: ${event.category}:${event.action}`);

    for (const decision of this.decisionTrees) {
      for (const newEvent of decision.evaluate(ctx)) {
        if (newEvent.type == DEvents.None) { continue; }

        this.process(newEvent, ctx);
      }
    }

    ctx.leaveEvent();

    if (ctx.level == 0 && this.canSave && ctx.shouldSave) {
      state.save().then(() => {
        state.get().then((stateVal) => {
          self.postMessage(new DStateReloadEvent(stateVal));
        });
      });
    }
  }

  processRaw(rawEvent: DEventRaw) {
    const map: { [key in DEvents]: (e: DEventRaw) => DEventBase<Extract<DEvents, DEvents>> | null } = {
      [DEvents.None]: (e) => null,
      [DEvents.ItemNew]: (e) => new DItemNewEvent(e.data as Item),
      [DEvents.ItemEdit]: (e) => new DItemEditEvent(e.data as Item),
      [DEvents.ItemDelete]: (e) => new DItemDeleteEvent(e.data.uuid),
      [DEvents.DecisionNew]: (e) => new DDecisionNewEvent(e.data as DecisionTree<Extract<DEvents, DEvents>, Extract<DEvents, DEvents>>),
      [DEvents.DecisionEdit]: (e) => new DDecisionEditEvent(e.data as DecisionTree<Extract<DEvents, DEvents>, Extract<DEvents, DEvents>>),
      [DEvents.DecisionDelete]: (e) => new DDecisionDeleteEvent(e.data.uuid),
      [DEvents.StateFetch]: (_) => new DStateFetchEvent(),
      [DEvents.StateReload]: (e) => new DStateReloadEvent(e.data as KnockItOutState),
    };

    if (!(rawEvent.type in map)) {
      throw new Error(`Unsupported raw event category ${rawEvent.category}`);
    }

    let converted = map[rawEvent.type](rawEvent);
    if (!converted) {
      return;
    }

    this.process(converted);
  }
}
