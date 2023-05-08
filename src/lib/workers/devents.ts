import { EventProcessor } from './event_processor';
import {BUILTIN_DECISION_TREES} from './builtin_decisions';
import {DEventRaw} from './types';

const EVENT_PROCESSOR = new EventProcessor(true);
for (const decision of BUILTIN_DECISION_TREES) {
  EVENT_PROCESSOR.addDecisionTree(decision);
}

self.onmessage = (e: MessageEvent<DEventRaw>) => {
  EVENT_PROCESSOR.processRaw(e.data);
};

const blank = {};
export default blank;
