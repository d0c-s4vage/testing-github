import { openDB, DBSchema } from 'idb';
import { KnockItOutState } from '@/models/all';

export let STATE: KnockItOutState | null = null;

interface Schema extends DBSchema {
  states: {
    key: string;
    value: {[key: string]: any};
  }
};

async function load(): Promise<KnockItOutState> {
  // TODO full error handling, etc.
  let db = await openDB<Schema>("knock-it-out", 1, {
    upgrade(db) {
      db.createObjectStore("states");
    }
  });
  let state = await db.get("states", "main");
  const res = {
    items: state?.items || [],
  };
  return res;
}

async function save() {
  if (STATE == null) {
    STATE = await load();
  }

  let db = await openDB("knock-it-out", 1);
  await db.put("states", STATE, "main");
}


async function get(): Promise<KnockItOutState> {
  if (STATE === null) {
    STATE = await load();
  }

  return STATE;
}

function getSync(): KnockItOutState {
  if (STATE === null) {
    throw new Error("State isn't set yet for sync get!");
  }
  return STATE;
}

const toExport = {
  get,
  getSync,
  save,
};

export default toExport;
