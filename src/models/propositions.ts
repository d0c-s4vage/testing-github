import Context from '@/lib/workers/context'
import {Handler} from '@/types/handlers';
import {Item} from './all';

// need to forward typing all the in as well?
// AND Clause

export enum PropositionType {
  Compound = "compound",
  True = "true",
  Regex = "regex",
};

export interface PropositionData {
  type: PropositionType;
  config: Record<string, any>,
}

export interface Proposition extends PropositionData {
  type: PropositionType;
  config: Record<string, any>;

  canEvaluate(ctx: Context): boolean;
  evaluate(ctx: Context): boolean;

  toObj(): PropositionData;
  // static fromObj as well!
}

export function LoadProposition(data: PropositionData) {
  const map: {[key in PropositionType]: (d: any) => Proposition} = {
    [PropositionType.Compound]: (d: CompoundPropData) => CompoundProp.fromObj(d),
    [PropositionType.Regex]: (d: RegexPropData) => RegexProp.fromObj(d),
    [PropositionType.True]: (d: TruePropData) => TrueProp.fromObj(d),
  };

  if (!(data.type in map)) {
    throw new Error(`Unexpecated proposition type ${data.type}`);
  }

  return map[data.type](data);
}

enum Conjunction {
  AND = "AND",
  OR = "OR",
};

export abstract class PropBase implements Proposition {
  abstract type: PropositionType;
  abstract evaluate(ctx: Context): boolean;
  abstract canEvaluate(ctx: Context): boolean;
  abstract config: Record<string, any>;
  abstract toObj(): PropositionData;
}

// ----------------------------------------------------------------------------

export interface TruePropConfig {}
export interface TruePropData extends PropositionData {
  type: PropositionType.True;
  config: TruePropConfig;
};
export class TrueProp extends PropBase {
  type: PropositionType = PropositionType.True;
  config: TruePropConfig;

  constructor(config: TruePropConfig = {}) {
    super();
    this.config = config;
  }

  canEvaluate(_ctx: Context): boolean { return true; }
  evaluate(_ctx: Context): boolean { return true; }

  toObj(): TruePropData {
    return {
      type: PropositionType.True,
      config: {...this.config},
    };
  }

  static fromObj(data: TruePropData): TrueProp {
    return new TrueProp(data.config);
  }
};

// ----------------------------------------------------------------------------

export interface CompoundPropConfig {
  propositions: Proposition[];
};
export interface CompoundPropData extends PropositionData {
  type: PropositionType.Compound,
  conjunction: Conjunction,
  config: {
    propositions: PropositionData[],
  }
};

export class CompoundProp extends PropBase implements CompoundPropData {
  type: PropositionType.Compound = PropositionType.Compound;
  conjunction: Conjunction;
  config: CompoundPropConfig;

  constructor(conjunction: Conjunction, config: CompoundPropConfig) {
    super();
    this.conjunction = conjunction;
    this.config = config;
  }

  toObj(): CompoundPropData {
    return {
      type: PropositionType.Compound,
      conjunction: this.conjunction,
      config: {
        propositions: this.config.propositions.map((p) => p.toObj()),
      }
    };
  }

  static fromObj(data: CompoundPropData): CompoundProp {
    return new CompoundProp(
      data.conjunction,
      {
        propositions: data.config.propositions.map((p) => LoadProposition(p)),
      }
    );
  }

  addProposition(prop: Proposition) {
    this.config.propositions.push(prop);
  }

  isOr(): boolean { return this.conjunction == Conjunction.OR }; 
  isAnd(): boolean { return this.conjunction == Conjunction.AND }; 

  canEvaluate(ctx: Context): boolean {
    for (const prop of this.config.propositions) {
      if (!prop.canEvaluate(ctx)) {
        return false;
      }
    }
    return true;
  }

  evaluate(ctx: Context): boolean {
    for (const prop of this.config.propositions) {
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

function ExtractFields<T=any>(obj: Record<string, any>, filterFn: Handler<T,boolean>, currPath: string[] = [], origObj?: Record<string, any>): FieldPtr<T>[] {
  const res = [];
  const _origObj: Record<string, any> = origObj || obj;

  for (let prop in obj) {
    if (prop == "__private") {
      continue;
    }

    const val = obj[prop];
    if (filterFn(val)) {
      res.push(new FieldPtr(_origObj, [...currPath, prop]));
    }

    if (typeof val === "object") {
      currPath.push(prop);
      res.push(...ExtractFields(val, filterFn, currPath, _origObj));
      currPath.pop();
    }
  }

  return res;
}

// ----------------------------------------------------------------------------
// PROPOSITION IMPLEMENTATIONS

export interface RegexPropConfig {
  regex: string;
};
export interface RegexPropData extends PropositionData {
  type: PropositionType.Regex,
  config: RegexPropConfig,
};

export class RegexProp extends PropBase implements RegexPropData {
  type: PropositionType.Regex = PropositionType.Regex;
  config: RegexPropConfig;

  constructor(config: RegexPropConfig) {
    super();
    this.config = config;
  }

  canEvaluate(_: Context): boolean { return true; }

  toObj(): RegexPropData {
    return {
      type: this.type,
      config: {...this.config},
    };
  }

  static fromObj(obj: RegexPropData): RegexProp {
    return new RegexProp({...obj.config});
  }

  evaluate(ctx: Context): boolean {
    // find all string fields, recursive, in the event, ignoring any
    // subfields of "internal"
    const strFilter = (val: any): boolean => (typeof val == "string");

    for (const ptr of ExtractFields<string>(ctx.currFrame.event, strFilter)) {
      if (ptr.deref().search(new RegExp(this.config.regex)) != -1) {
        return true;
      }
    }

    return false;
  }
}
