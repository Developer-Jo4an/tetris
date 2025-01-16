export default class TetrisFactory {
  static library = {};


  //getters
  static getItemById(type, id) {
    if (!TetrisFactory.library[type]) return;

    return TetrisFactory.library[type].find(({id: itemId}) => itemId === id);
  }

  static getCollectionByType(type) {
    return TetrisFactory.library[type];
  }

  static getLibrary() {
    return TetrisFactory.library;
  }


  //setters
  static setItemByType(type, entity) {
    if (!TetrisFactory.library[type])
      TetrisFactory.library[type] = [];

    TetrisFactory.library[type].push(entity);
  }

  setCollectionByType(type, collection) {
    TetrisFactory.library[type] = collection;
  }


  // clear
  static clearItemByEntity(type, entity) {
    TetrisFactory.library[type] = TetrisFactory.library[type].filter(item => item !== entity);
  }

  static clear() {
    TetrisFactory.library = {};
  }
}
