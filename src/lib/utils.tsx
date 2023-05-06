import { Handler } from '@/types/handlers';

/**
 * Simple deletion of an item from an array. Returns success of operation.
 */
function arrayDelete<T>(array: T[], item: Handler<T, boolean>): boolean {
  let idx = array.findIndex(item);
  if (idx == -1) { return false; }

  array.splice(idx, 1);
  return true;
}

/**
 * Simple replacing of an item in an array. Returns success of operation.
 */
function arrayReplace<T>(array: T[], matchFn: Handler<T, boolean>, replace: T): boolean {
  const idx = array.findIndex(matchFn);
  if (idx == -1) { return false; }
  array[idx] = replace;
  return true;
}

/**
 * Implement unique object ids
 */
const OBJ_MAP = new WeakMap<object, number>();
let OBJ_COUNT = 0;
function objectId(object: Object): number {
  if (!OBJ_MAP.has(object)) {
    OBJ_MAP.set(object, ++OBJ_COUNT);
  }
  const res = OBJ_MAP.get(object);
  if (!res) {
    throw Error("Result should always be defined");
  }
  return res;
}

export default {
  arrayDelete,
  arrayReplace,
  objectId,
};
