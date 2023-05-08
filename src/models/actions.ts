import {DEventBase, DEvents, DItemDeleteEvent, DItemEditEvent, DItemNewEvent, DNoneEvent, DStateFetchEvent} from "@/lib/workers/types";
import Context from '@/lib/workers/context';
import state from '@/lib/workers/state';
import utils from '@/lib/utils';
import {Item} from "./all";

export enum Actions {
  Callback = "callback",
  ItemSave = "item_save",
  StateFetch = "state_fetch",
};

export interface ActionData {
  type: Actions;
  supportedEvents: DEvents[];
  shouldPropagate: boolean;
};

export abstract class Action<InputEvent extends DEvents, OutputEvent extends DEvents> implements ActionData {
  abstract shouldPropagate: boolean;
  abstract type: Actions;
  abstract supportedEvents: DEvents[];
  abstract run(inputEvent: DEventBase<InputEvent>, ctx: Context): DEventBase<OutputEvent>;
}

export function LoadAction(data: ActionData) {
  const map: {[key in Actions]: (d: any) => any} = {
    [Actions.ItemSave]: (d: ItemSaveAction) => {
      const res = Object.create(ItemSaveAction);
      Object.assign(res, d);
      return res;
    },
    [Actions.StateFetch]: (d: StateFetchAction) => {
      const res = Object.create(StateFetchAction);
      Object.assign(res, d);
      return res;
    },
    [Actions.Callback]: (_: any) => {
      throw new Error("Shouldn't be serializing callback actions!!");
    },
  };

  if (!(data.type in map)) {
    throw new Error(`Unexpected action type, can't load ${data.type}`);
  }

  return map[data.type](data);
}

// ----------------------------------------------------------------------------
// STATE ACTIONS
// ----------------------------------------------------------------------------

const STATE_FETCH_INPUTS = [ DEvents.StateFetch ];

export class StateFetchAction extends Action<typeof STATE_FETCH_INPUTS[number], DEvents.None> {
  type: Actions = Actions.StateFetch;
  supportedEvents = STATE_FETCH_INPUTS;
  shouldPropagate = false;

  run(_event: DStateFetchEvent, ctx: Context): DNoneEvent {
    // Saving will trigger a reload by the event processor
    ctx.shouldSave = true;
    return new DNoneEvent();
  }
}

// ----------------------------------------------------------------------------
// ITEM ACTIONS
// ----------------------------------------------------------------------------

const ITEM_SAVE_INPUTS = [DEvents.ItemNew, DEvents.ItemEdit, DEvents.ItemDelete];

export class ItemSaveAction extends Action<typeof ITEM_SAVE_INPUTS[number], DEvents.None> {
  type: Actions = Actions.ItemSave;
  shouldPropagate = false;
  supportedEvents = ITEM_SAVE_INPUTS;

  run(event: DEventBase<typeof ITEM_SAVE_INPUTS[number]>, ctx: Context): DNoneEvent {
    const _state = state.getSync();

    switch (event.type) {
      case DEvents.ItemNew:
        let newEvent = event as DItemNewEvent;
        _state.items.push(Item.fromObj(newEvent.data));
        ctx.shouldSave = true;
        break;
      case DEvents.ItemEdit:
        const editEvent = event as DItemEditEvent;
        const editRes = utils.arrayReplace(_state.items, (x) => x.uuid == editEvent.data.uuid, Item.fromObj(editEvent.data));
        if (editRes) {
          ctx.shouldSave = true;
        }
        break;
      case DEvents.ItemDelete:
        const delEvent = event as DItemDeleteEvent;
        const delRes = utils.arrayDelete(_state.items, (x) => (x.uuid === delEvent.data.uuid));
        if (delRes) {
          ctx.shouldSave = true;
        }
        break;
    }
    return new DNoneEvent();
  }
}

// ----------------------------------------------------------------------------
// CALLBACK ACTIONS
// ----------------------------------------------------------------------------

export class CallbackAction<EventType extends DEvents> extends Action<EventType, DEvents.None> {
  type = Actions.Callback;
  shouldPropagate = false;
  supportedEvents: DEvents[];
  callback: (e: DEventBase<EventType>) => void;

  constructor(eventType: EventType, callback: (e: DEventBase<EventType>) => void) {
    super();
    this.supportedEvents = [eventType];
    this.callback = callback;
  }

  run(event: DEventBase<EventType>, _ctx: Context): DNoneEvent {
    this.callback(event);
    return new DNoneEvent();
  }
}
