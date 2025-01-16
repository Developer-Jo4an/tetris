export default class TetrisFactory {
  static library = {};

  static setItemByType(type, entity) {
    if (!TetrisFactory.library[type])
      TetrisFactory.library[type] = [];

    TetrisFactory.library[type].push(entity);
  }

  static getItemById(type, id) {
    if (!TetrisFactory.library[type]) return;

    return TetrisFactory.library[type].find(({id: itemId}) => itemId === id);
  }

  static getCollectionByType(type) {
    return TetrisFactory.library[type];
  }

  static clear() {
    TetrisFactory.library = {};
  }
}