import Manager from "../managers/Manager";

let key = 0;
export default class BaseLoader {

  manager;

  constructor(manager, data) {
    this.manager = manager || new Manager();
    this.data = data;
  }

  get loadingKey() {
    return key++;
  }

  load(url) {
    const key = this.loadingKey;
    this.manager.itemStart(url, key);
    return key;
  }

  onLoad(settings, resource, key) {
    this.manager.itemEnd(settings, resource, this, key);
  }

  onError(key, ...args) {
    this.manager.itemError(this, key, ...args);
  }
}
