//todo: сделать фабрику, так как слишком много квадратиков генерируется в процессе игры,
// либо надежда на метод destroy у pixi, что он освобождает полностью память :)
export default class TetrisContainer {
  static library = {};


  //getters
  static getItemById(type, id) {
    if (!TetrisContainer.library[type]) return;

    return TetrisContainer.library[type].find(({id: itemId}) => itemId === id);
  }

  static getCollectionByType(type) {
    return TetrisContainer.library[type];
  }

  static getLibrary() {
    return TetrisContainer.library;
  }


  //setters
  static setItemByType(type, entity) {
    if (!TetrisContainer.library[type])
      TetrisContainer.library[type] = [];

    TetrisContainer.library[type].push(entity);
  }

  setCollectionByType(type, collection) {
    TetrisContainer.library[type] = collection;
  }


  // clear
  static clearItemByEntity(type, entity) {
    TetrisContainer.library[type] = TetrisContainer.library[type].filter(item => item !== entity);
  }

  static clear() {
    TetrisContainer.library = {};
  }
}
