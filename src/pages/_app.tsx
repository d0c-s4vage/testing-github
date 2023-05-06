import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head';

import { useState, useEffect } from 'react';

import { KnockItOutState } from '@/models/all';
import { StateMutator, AppContext } from '@/components/context';
import { PageHeader, PageFooter, PageBody } from '@/components/layout';

import { DEventRaw, DStateEvent, DEvents } from '@/lib/workers/types';
import type { EventHandlers } from '@/lib/workers/event_processor';
import { EventProcessor } from '@/lib/workers/event_processor';


function handleWorkerMessage(
  event: MessageEvent<DEventRaw>,
  setState: (state: KnockItOutState) => void
) {
  const handlers: EventHandlers = {
    stateHandler: (event, _) => {
      if (event.action == "reload" && event.data !== null) {
        setState({...event.data});
      }
      return [];
    },
  };
  const eventProcessor = new EventProcessor(handlers, false);

  eventProcessor.processRaw(event.data);
}


export default function App({ Component, pageProps }: AppProps) {
  const [state, setState] = useState<KnockItOutState>({items: []});
  const [dEventWorker, setDEventWorker] = useState<Worker>();

  // load once from local storage initially
  useEffect(() => {
    const worker = new Worker(new URL("../lib/workers/devents", import.meta.url));
    worker.onmessage = (event: MessageEvent<DEventRaw>) => {
      handleWorkerMessage(event, setState);
    };
    worker.postMessage(new DStateEvent(DEvents.StateFetch));
    setDEventWorker(worker);
  }, []);

  const stateMutator: StateMutator | undefined = dEventWorker ? new StateMutator(dEventWorker) : undefined;

  return <AppContext.Provider value={{state, stateMutator}}>
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com"/>
    </Head>
    <PageHeader/>
    <PageBody>
      <Component {...pageProps} />
    </PageBody>
    <PageFooter />
  </AppContext.Provider>;
}
