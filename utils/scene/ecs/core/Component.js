export default class Component {

  /**
   * CHANGE - событие на изменение данных компонента
   * CREATE  - событие на создание компонента
   * REMOVE   - событие на удаление компонента
   * ADD    - событие на добавление компонента в сущность
   * @type {{ADD: string, CREATE: string, REMOVE: string, CHANGE: string}}
   */
  static EVENTS = {
    CHANGE: "component:change",
    REMOVE: "component:remove",
    ADD: "component:add",
    CREATE: "component:create",
  }

  /**
   * Тип компонента для возможности фильтрации компонентов
   * @type {string}
   */
  type = "unknown";

  /**
   * Общий для всех элементов одного движка хаб событий
   * @type  {EventBus}
   */
  eventBus;

  /**
   * Ссылка на сущность, в которой существует компонент
   * @type {null, Entity}
   * @private
   */
  _entity = null;

  constructor({eventBus}) {
    this.eventBus = eventBus;
  }

  /**
   * Изменяется сущностью при добавлении\удалении компонента
   * @param entity
   */
  set entity(entity) {
    this._entity = entity;
    if (entity)
      this.onAdd();
    else
      this.onRemove();
  }

  /**
   * Получение сущности, в которой существует компонент
   * @returns {Entity|null}
   */
  get entity() {
    return this._entity;
  }

  /**
   * Функция инициализации компонента
   * @returns {Component}
   */
  init() {
    this.onCreate();
    return this;
  }

  /**
   * Шорткат для диспатча событий
   * @param type {string}- тип события
   * @param data {object}- данные
   */
  dispatch(type, data) {
    this.eventBus.dispatchEvent({type, data})
  }

  /**
   * Коллбек при создании компонента
   */
  onCreate() {
    this.dispatch(Component.EVENTS.CREATE, {component: this})
  }

  /**
   * Коллбек при добавлении компонента
   */
  onAdd() {
    this.dispatch(Component.EVENTS.ADD, {component: this})
  }

  /**
   * Коллбек при удалении компонента
   */
  onRemove() {
    this.dispatch(Component.EVENTS.REMOVE, {component: this})
  }

  /**
   * Коллбек при изменении данных компонента
   */
  onChange() {
    this.dispatch(Component.EVENTS.CHANGE, {component: this})
  }
}
