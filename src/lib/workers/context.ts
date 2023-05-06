export default class Context {
  private _shouldSave: boolean;
  private _level: number;

  constructor() {
    this._shouldSave = false;
    this._level = 0;
  }

  public get level(): number {
    return this._level;
  }

  public incLevel() {
    this._level++;
  }

  public decLevel() {
    if (this._level <= 0) {
      throw new Error("Should not be decrementing the level less than 0");
    }

    this._level--;
  }

  public get shouldSave(): boolean {
    return this._shouldSave;
  }

  public set shouldSave(val: boolean) {
    this._shouldSave = val;
  }
}
