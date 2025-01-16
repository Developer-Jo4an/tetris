export default class System {

  /**
   * Порядковый номер для сортировки обновления систем
   * @type {number}
   */
  updateOrder = 0;

  /**
   * Общий для всех элементов одного движка хаб событий
   * @type  {EventBus}
   */
  eventBus;

  /**
   * Ссылка на движок системы
   * @private
   */
  _engine;

  constructor({eventBus}) {
    this.eventBus = eventBus;
  }

  /**
   * Инициализация системы
   */
  init() {

  }

  /**
   * Получение списка  сущностей по типу
   * @param type
   * @returns {*}
   */
  getEntitiesByType(type) {
    return this._engine.getEntitiesByType(type);
  }

  /**
   * Получение всех компонентов
   * @returns {T|Collection<Component>}
   */
  get allComponents() {
    return this._engine.allComponents;
  }

  /** Хелпер для добавление компонента в сущность
   *
   * @param entity {Entity}
   * @param ComponentClass {Class<Component>}
   * @param settings {any}- настройки компонента
   * @param condition - условие добавления компонента
   * @returns {Component|null}
   */
  addComponentToEntity(entity, ComponentClass, settings = {}, condition = true) {
    if (!condition) return null;
    const component = new ComponentClass(settings).init();
    entity.add(component);
    return component;
  }

  /** Хелрер для массовое добавление компонентов в сущность
   *
   * @param entity {Entity}
   * @param components {Array<{ComponentClass: Class<Component, settings: any}>} - массив настроек компонентов
   * @param isInit  - инициализация сущности
   * @returns  {Entity}
   */
  addComponentsToEntity(entity, components, isInit = true) {
    components.forEach(({class: ComponentClass, settings, condition = true}) => {
      this.addComponentToEntity(entity, ComponentClass, settings, condition);
    });
    if (isInit)
      entity.init(); // инициализация сущности

    return entity;
  }

  /**
   * Установка движка при добавлении системы в движок
   * @param engine
   */
  set engine(engine) {
    this._engine = engine;
  }

  /**
   * Обновление системы
   * @param data
   */
  update(data) {

  }

  /**
   * Сброс системы
   */
  reset() {
  }


  /**
   * Функция конфигурирования систем
   * @param settings
   */
  configure(settings) {

  }
}

