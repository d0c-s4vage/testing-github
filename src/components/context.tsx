import { createContext } from 'react';

import { DItemDeleteEvent, DItemEditEvent, DItemNewEvent } from '@/lib/workers/types';
import { KnockItOutState, Item } from '@/models/all';

export class StateMutator {
  worker: Worker;

  constructor(worker: Worker) {
    this.worker = worker;
  }

  deleteItem(item: Item) {
    this.worker.postMessage(new DItemDeleteEvent(item.uuid));
  }

  editItem(item: Item) {
    this.worker.postMessage(new DItemEditEvent(item));
  }

  newItem(item: Item) {
    this.worker.postMessage(new DItemNewEvent(item));
  }
}

export type AppContextType = {
  state: KnockItOutState;
  stateMutator?: StateMutator;
};

export const AppContext = createContext<AppContextType>({
  state: new KnockItOutState(),
});
