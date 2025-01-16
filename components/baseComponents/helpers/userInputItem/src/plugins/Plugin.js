export default class Plugin {

  subscribers = [];

  order = 0;

  changed = false;

  items = null;


  constructor({items}) {
    this.items = items;
  }

  update() {

  }

  resetChanged() {
    this.changed = false;

    this.subscribers.forEach((item) => {
      if (item[this.name])
        item[this.name].changed = false
    });
  }

  subscribe(item) {
    if (this.subscribers.includes(item)) return;

    this.subscribers.push(item);

    this.setItemData(item);
  }

  setItemData(item) {

  }

  unsubscribe(item) {
    if (!this.subscribers.includes(item)) return;

    this.subscribers.splice(this.subscribers.indexOf(item), -1);
  }

  informSubscribers() {
    this.subscribers.forEach((item) => this.updateItemData(item));
  }

  informSubscriber(item) {
    if (!this.subscribers.includes(item)) return;

    this.updateItemData(item);
  }


  updateItemData(item) {

  }
}
