import { createContext } from 'react';

import { DEvents, DItemEvent, DDecisionEvent } from '@/lib/workers/types';
import { KnockItOutState, Item, Decision } from '@/models/all';


export class StateMutator {
  worker: Worker;

  constructor(worker: Worker) {
    this.worker = worker;
  }

  deleteItem(item: Item) {
    this.worker.postMessage(new DItemEvent(DEvents.ItemDelete, item));
  }

  editItem(item: Item) {
    this.worker.postMessage(new DItemEvent(DEvents.ItemEdit, item));
  }

  newItem(item: Item) {
    this.worker.postMessage(new DItemEvent(DEvents.ItemNew, item));
  }
}

export type AppContextType = {
  state: KnockItOutState;
  stateMutator?: StateMutator;
};

export const AppContext = createContext<AppContextType>({
  state: { items: [] },
});
