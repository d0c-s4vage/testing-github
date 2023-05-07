
export type Uuid = string;

export class UuidHaver {
  uuid: Uuid;

  constructor() {
    this.uuid = crypto.randomUUID();
  }
}
