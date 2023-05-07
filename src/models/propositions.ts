import type { Uuid } from './bases';
import { UuidHaver } from './bases';
import Context from '@/lib/workers/context'
import {Handler} from '@/types/handlers';

// need to forward typing all the in as well?
// AND Clause

export interface Proposition {
  uuid: Uuid;
  name: string;
  publicFields: string[];

  canEvaluate(ctx: Context): boolean;
  evaluate(ctx: Context): boolean;
}

enum Conjunction {
  AND = "AND",
  OR = "OR",
};

type OwnFields<T> = (keyof T & string)[];

export abstract class PropBase<PropType> extends UuidHaver implements Proposition {
  abstract name: string;
  abstract evaluate(ctx: Context): boolean;
  abstract canEvaluate(ctx: Context): boolean;
  abstract publicFields: OwnFields<PropType>;
}

export class CompoundProposition extends PropBase<CompoundProposition> {
  conjunction: Conjunction;
  propositions: Proposition[];
  publicFields: OwnFields<CompoundProposition> = ["propositions"];

  constructor(conjunction: Conjunction, ...propositions:Proposition[]) {
    super();
    this.conjunction = conjunction;
    this.propositions = propositions;
  }

  get name(): string { return this.conjunction; }

  addProposition(prop: Proposition) {
    this.propositions.push(prop);
  }

  isOr(): boolean { return this.conjunction == Conjunction.OR }; 
  isAnd(): boolean { return this.conjunction == Conjunction.AND }; 

  canEvaluate(ctx: Context): boolean {
    for (const prop of this.propositions) {
      if (!prop.canEvaluate(ctx)) {
        return false;
      }
    }
    return true;
  }

  evaluate(ctx: Context): boolean {
    for (const prop of this.propositions) {
      const val = prop.evaluate(ctx);
      if (val && this.isOr()) {
        return true;
      }
      if (!val && this.isAnd()) {
        return false;
      }
    }
    // if an or gets to this point, then nothing matched, so return false
    // if an and gets to this point, then everything matched, so return true
    return this.isAnd();
  }
}
// ----------------------------------------------------------------------------
// PROPOSITION UTILITIES

/**
 * Implements easy methods for referencing deeply nested fields inside of
 * objects
 */
class FieldPtr<T=any> {
  obj: object;
  path: string[];

  constructor(obj: object, path: (string)[]) {
    this.obj = obj;
    this.path = path;
  }

  cloneFor(otherObj: object): FieldPtr {
    return new FieldPtr(otherObj, [...this.path]);
  }

  /**
   * Returns undefined if the path is invalid.
   */
  deref(): T {
    let currObj: Record<(string|number), any> = this.obj;
    for (const field of this.path) {
      currObj = currObj[field];
    }
    return currObj as T;
  }

  toString(): string {
    return `<FieldPtr path=${this.path.join(".")}>`
  }
}

function ExtractFields<T=any>(obj: Record<string, any>, filterFn: Handler<T,boolean>, currPath: string[] = []): FieldPtr<T>[] {
  const res = [];

  for (let prop in obj) {
    if (prop == "__private") {
      continue;
    }

    const val = obj[prop];
    if (filterFn(val)) {
      res.push(new FieldPtr(obj, [...currPath, prop]));
    }

    if (typeof val === "object") {
      currPath.push(prop);
      ExtractFields(obj, filterFn, currPath);
      currPath.pop();
    }
  }

  return res;
}

// ----------------------------------------------------------------------------
// PROPOSITION IMPLEMENTATIONS

export class PropRegex extends PropBase<PropRegex> {
  name: string = "Regex";
  regex: string;
  publicFields: OwnFields<PropRegex> = ["regex"];

  constructor(regex: string) {
    super();
    this.regex = regex;
  }

  canEvaluate(_: Context): boolean { return true; }

  evaluate(ctx: Context): boolean {
    // find all string fields, recursive, in the event, ignoring any
    // subfields of "internal"
    
    const strFilter = (val: any): boolean => (typeof val == "string");

    for (const ptr of ExtractFields<string>(ctx.currFrame.event, strFilter)) {
      if (ptr.deref().search(this.regex) != -1) {
        return true;
      }
    }

    return false;
  }
}
