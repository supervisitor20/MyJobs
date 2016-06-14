export default class IdGenerator {
  constructor() {
    this.currentId = 0;
  }

  nextId() {
    this.currentId += 1;
    return this.currentId;
  }
}
