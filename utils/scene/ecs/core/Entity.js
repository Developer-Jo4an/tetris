export default class Entity {

  /**
   * CHANGE    - событие для изменения сущности
   * REMOVE    - событие для удаления сущности
   * ENABLE    - событие для включения сущности
   * DISABLE   - событие для отключения сущности
   * CREATE    - событие для создания сущности
   * @type {{DISABLE: string, CREATE: string, REMOVE: string, CHANGE: string, ENABLE: string}}
   */
  static EVENTS = {
    CHANGE: "entity:change",
    REMOVE: "entity:remove",
    CREATE: "entity:create",
    ENABLE: "entity:enable",
    DISABLE: "entity:disable",
  };

  /**
   * Тип сущности для возможности последующей фильтрации
   * @type {string}
   */
  type = "unknown";

  /**
   * Группы сущности для дополнительной фильтрации
   * @type {string}
   */
  group = "unknown";

  /**
   * Список компонентов сущности
   * @type {[]}
   */
  children = [];

  /**
   * Общий для всех элементов одного движка хаб событий
   * @type  {EventBus}
   */
  eventBus;

  constructor({eventBus, type, group}) {
    this.eventBus = eventBus;
    this.type = type ?? this.type;
    this.group = group ?? this.type;
  }

  /**
   * Получение компонента по типу
   * @param type {string}
   * @returns {Component}
   */
  getComponentByType(type) {
    return this.children.find(({type: cType}) => cType === type);
  }

  /**
   * Инициализация сущности
   */
  init() {
    this.onCreate();
  }

  /**
   * Добавледение компонента в сущность
   * @param child
   */
  add(child) {
    this.children.push(child);
    child.entity = this;
    this.onChange();
  }

  /**
   * Удаление компонента из сущности
   * @param child
   */
  remove(child) {
    if (!this.children.includes(child)) return;

    this.children.splice(this.children.indexOf(child), 1);
    child.entity = null;
  }

  /**
   * Полная очистка сущности
   */
  destroy() {
    this.removeAll();
    this.onRemove();
  }

  /**
   * Удаление всех компонентов сущности
   */
  removeAll() {
    const {children} = this;
    children.forEach(child => child.entity = null);
    children.length = 0;
  }

  /**
   * Шорткат создание сущности
   * @param type
   * @param data
   */
  dispatch(type, data) {
    this.eventBus.dispatchEvent({type, data});
  }

  /** Коллбек на создание сущности
   */
  onCreate() {
    this.dispatch(Entity.EVENTS.CREATE, {entity: this});
  }

  /** Коллбек на удаление сущности
   */
  onRemove() {
    this.dispatch(Entity.EVENTS.REMOVE, {entity: this});
  }

  /** Коллбек на изменение сущности
   */
  onChange() {
    this.dispatch(Entity.EVENTS.CHANGE, {entity: this});
  }

  /** Деакализация сущности
   */
  disable() {
    this.dispatch(Entity.EVENTS.DISABLE, {entity: this});
  }

  /** Активация сущности
   */
  enable() {
    this.dispatch(Entity.EVENTS.ENABLE, {entity: this});
  }

}
