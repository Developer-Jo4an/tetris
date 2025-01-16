export default class Collection {

  name;

  list = [];

  constructor({name}) {
    this.name = name;
  }

  sort(fnc) {
    return this.list.sort(fnc);
  }

  add(item) {
    const {list} = this;
    if (list.includes(item)) return;
    list.push(item);
  }

  remove(item) {
    const {list} = this;
    if (!list.includes(item)) return;
    list.splice(list.indexOf(item), 1);
  }
}



