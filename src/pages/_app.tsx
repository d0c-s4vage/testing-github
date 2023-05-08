import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head';
import { Roboto } from 'next/font/google';

import { useState, useEffect } from 'react';

import { DecisionTree, EventEdge, KnockItOutState } from '@/models/all';
import { StateMutator, AppContext } from '@/components/context';
import { PageHeader, PageFooter, PageBody } from '@/components/layout';

import { DEventBase, DEventRaw, DEvents, DStateFetchEvent, DStateReloadEvent } from '@/lib/workers/types';
import { EventProcessor } from '@/lib/workers/event_processor';
import { CallbackAction } from '@/models/actions';
import {TrueProp} from '@/models/propositions';

const roboto = Roboto({ subsets: ['latin'], weight: '400' });

type Handlers = {
  stateReload: (e: DEventBase<DEvents.StateReload>) => void,
};

function handleWorkerMessages(
  event: MessageEvent<DEventRaw>,
  handlers: Handlers,
) {
  const eventProcessor = new EventProcessor(false);
  eventProcessor.addDecisionTree(
    new DecisionTree<DEvents.StateReload, DEvents.None>({
      name: "[APP:Builtin] Load State",
      description: "",
      events: [DEvents.StateReload],
      edges: [
        new EventEdge(
          new TrueProp(),
          new CallbackAction(
            DEvents.StateReload,
            handlers.stateReload,
          ),
        )
      ],
    })
  );

  eventProcessor.processRaw(event.data);
}


export default function App({ Component, pageProps }: AppProps) {
  const [state, setState] = useState<KnockItOutState>(new KnockItOutState());
  const [dEventWorker, setDEventWorker] = useState<Worker>();

  // load once from local storage initially
  useEffect(() => {
    const worker = new Worker(new URL("../lib/workers/devents", import.meta.url));
    worker.onmessage = (event: MessageEvent<DEventRaw>) => {
      handleWorkerMessages(event, {
        stateReload: (e) => {
          let event = e as DStateReloadEvent;
          if (event.data == null) { return; }
          setState(KnockItOutState.fromObj(event.data));
        }
      });
    };
    worker.postMessage(new DStateFetchEvent());
    setDEventWorker(worker);
  }, []);

  const stateMutator: StateMutator | undefined = dEventWorker ? new StateMutator(dEventWorker) : undefined;

  return <AppContext.Provider value={{state, stateMutator}}>
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com"/>
    </Head>
    <div className={roboto.className}>
      <PageHeader/>
      <PageBody>
        <Component {...pageProps} />
      </PageBody>
      <PageFooter />
    </div>
  </AppContext.Provider>;
}
