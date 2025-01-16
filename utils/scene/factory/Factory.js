import FactoryStorage from "./FactoryStorage";

export default class Factory {

  storage = {};

  constructor() {
  }


  createItem(type, data) {
    const item = {};
    this.onCreateItem(type, item, data);
    return item;
  }


  onCreateItem(type, item, data) {
    const storage = this.getStorage(type, item);
    storage.onCreateItem(type, item, data);
  }

  getItem(type, data) {
    const storage = this.getStorage(type);
    let item = storage.pop();

    if (!item)
      item = this.createItem(type, data);

    return item;
  }

  resetStorageItems(type) {
    const storage = this.getStorage(type);
    return storage.resetItems();
  }

  pushItem(item, type) {
    type = type || item._storageType || "unknown";
    const storage = this.getStorage(type);
    storage.push(item);
  }

  getStorage(type) {
    if (this.storage[type]) return this.storage[type];

    this.storage[type] = new FactoryStorage({type});

    return this.storage[type];
  }
}
