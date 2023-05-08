import {DEventBase} from "./types";

type ContextFrame = {
  event: any,
  data: {[key: string]: any}[];
};

export default class Context {
  private _shouldSave: boolean;
  private _eventStack: ContextFrame[];

  constructor() {
    this._shouldSave = false;
    this._eventStack = [];
  }

  get currEvent() {
    return this.currFrame.event;
  }

  get currFrame(): ContextFrame {
    if (this._eventStack.length == 0) {
      throw new Error("Cannot fetch current event, event stack is empty");
    }
    return this._eventStack[this._eventStack.length - 1];
  }

  get level(): number {
    return this._eventStack.length;
  }

  enterEvent(event: DEventBase<any>) {
    this._eventStack.push({event, data: []});
  }

  pushDataContext(data: {[key: string]: any}) {
    this.currFrame.data.push(data);
    return this;
  }

  getDataContextValue(name: string, val: any): any {
    // TODO
  }

  leaveEvent() {
    if (this._eventStack.length == 0) {
      throw new Error("No more events to leave!");
    }

    const res = this._eventStack.pop();
    if (res === undefined) {
      throw new Error("This should never happen");
    }
  }

  get shouldSave(): boolean {
    return this._shouldSave;
  }

  set shouldSave(val: boolean) {
    this._shouldSave = val;
  }
}
