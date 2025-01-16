import Entity from "./Entity";
import Collection from "../../structures/Collection";
import Component from "./Component";

export default class Engine {

  /**
   * Список созданных систем.
   * @type {Collection}
   */
  systems = new Collection({name: "systems"});

  /**
   * группы сущностей
   * @type {{[entity-type]: Collection}}
   */
  entities = {};

  /**
   * список компонентов
   * @type {{[component-type]: Collection}}
   */
  components = {};

  constructor({eventBus}) {
    this.eventBus = eventBus;

    this.addListeners();
  }

  /**
   * Добавление системы
   * @param system
   */
  addSystem(system) {
    const {systems} = this;
    systems.add(system);
    system.engine = this;
    system.init();

    systems.sort((a, b) => a.updateOrder - b.updateOrder);
  }

  /**
   * Получение сущностей сопределенным типом
   * @param type {ыstring type}
   * @returns {*}
   */
  getEntitiesByType(type) {
    return this.entities[type];
  }

  /**
   * Получение всех компонентов
   * @returns {T}
   */
  get allComponents() {
    return Object.values(this.components).reduce((result, {list}) => [...result, ...list], []);
  }

  /**
   * Удаление системы
   * @param system
   */
  removeSystem(system) {
    const {systems} = this;
    systems.remove(system);
    system.engine = null;
  }

  /**
   * Добавление слушателей на действия с компонентами и сущностями
   */
  addListeners() {
    this.addEntityListeners();
    this.addComponentListeners();
  }

  /**
   * Добавление слушателей на действия с компонентами
   */
  addComponentListeners() {
    const {eventBus} = this;
    eventBus.addEventListener(Component.EVENTS.CHANGE, this.onComponentChanged.bind(this));
    eventBus.addEventListener(Component.EVENTS.ADD, this.onComponentAdded.bind(this));
    eventBus.addEventListener(Component.EVENTS.REMOVE, this.onComponentRemoved.bind(this));
    eventBus.addEventListener(Component.EVENTS.CREATE, this.onComponentCreated.bind(this));
  }

  /**
   * Коллбек на изменение компонента
   * @param component
   * @param type
   */
  onComponentChanged({data: {component, component: {type}}}) {
  }

  /**
   * Коллбек на добавление компонента
   * @param component
   * @param type
   */
  onComponentAdded({data: {component, component: {type}}}) {
    this.checkComponentCollection(type);
  }

  /**
   * Коллбек на удаление компонента
   * @param component
   * @param type
   */
  onComponentRemoved({data: {component, component: {type}}}) {
    this.checkComponentCollection(type);

    this.components[type].add(component)
  }

  /**
   * Коллбек на создание компонента
   * @param component
   * @param type
   */
  onComponentCreated({data: {component, component: {type}}}) {
    this.checkComponentCollection(type);

    this.components[type].add(component)
  }

  /**
   * Проверка существования коллекции компонентов оопределенного типа
   * @param type
   */
  checkComponentCollection(type) {
    if (!this.components[type])
      this.components[type] = new Collection({name: type})
  }

  /**
   * Добавление слушателей на действия с сущностями
   */
  addEntityListeners() {
    const {eventBus} = this;
    eventBus.addEventListener(Entity.EVENTS.CHANGE, this.onEntityChanged.bind(this));
    eventBus.addEventListener(Entity.EVENTS.REMOVE, this.onEntityRemoved.bind(this));
    eventBus.addEventListener(Entity.EVENTS.CREATE, this.onEntityCreated.bind(this));
  }

  /**
   * Коллбек на изменение сущности
   * @param entity
   */
  onEntityChanged({data: {entity}}) {
    //TODO: реализовать идею подписки на изменение определенного типа сущностей
  }

  /**
   * Коллбек на удаление сущности
   * @param entity
   * @param type
   */
  onEntityRemoved({data: {entity, entity: {type}}}) {
    this.checkEntityCollection(type);
    this.entities[type].remove(entity);
  }

  /**
   * Коллбек на создание сущности
   * @param entity
   * @param type
   */
  onEntityCreated({data: {entity, entity: {type}}}) {
    this.checkEntityCollection(type);
    this.entities[type].add(entity);
  }

  /**
   * Проверка существования коллекции сущностей оопределенного типа
   * @param type
   */
  checkEntityCollection(type) {
    if (!this.entities[type])
      this.entities[type] = new Collection({name: type})
  }

  /**
   * Обновление систем
   * @param data
   */
  update(data) {
    this.systems.list.forEach(system => system.update(data));
  }

  /**
   * Сборс систем
   */
  reset() {
    this.systems.list.forEach(system => system.reset());
  }

  /**
   * Функция конфигурирования систем
   * @param settings
   */
  configure(settings)  {
    this.systems.list.forEach(system => system.configure(settings));
  }

}
