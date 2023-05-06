import Context from './context';
import { DEventRaw, DItemEvent, DDecisionEvent, DStateEvent, DEventParsed } from './types';
import { EventProcessor } from './event_processor';
import state from './state';
import utils from '../utils';

function ProcessItemEvent(event: DItemEvent, ctx: Context): DEventParsed[] {
  ctx.shouldSave = true;
  const _state = state.getSync();

  switch (event.action) {
    case "edit":
      utils.arrayReplace(_state.items, (x) => x.uuid == event.data.uuid, event.data);
      break;
    case "new":
      _state.items.push(event.data);
      break;
    case "delete":
      utils.arrayDelete(_state.items, (x) => x.uuid == event.data.uuid);
      break;
  }
  return [];
}

function ProcessDecisionEvent(_event: DDecisionEvent, _ctx: Context): DEventParsed[] {
  return [];
}

function ProcessStateEvent(event: DStateEvent, ctx: Context): DEventParsed[] {
  switch (event.action) {
    case "fetch":
      // will also trigger the initial load if it hasn't happened yet
      ctx.shouldSave = true;
      break;
    default:
      throw new Error("Only fetch state is allowed to be processed within the worker");
  }

  return [];
}

const EVENT_PROCESSOR = new EventProcessor({
  itemHandler: ProcessItemEvent,
  stateHandler: ProcessStateEvent,
  decisionHandler: ProcessDecisionEvent,
});

self.onmessage = (e: MessageEvent<DEventRaw>) => {
  EVENT_PROCESSOR.processRaw(e.data);
};

const blank = {};
export default blank;
