import P2 from "p2";
import System from "../core/System";
import Component from "../core/Component";
import Matrix3Component from "../base/components/transform/Matrix3Component";
import {CollisionSystem} from "./CollisionSystem";

export default class PhysicsSystem extends System {

  static FPS = 1 / 60;

  pairs = [];

  constructor(props) {
    super(props);
    const {physicsSystem: data, ConnectionClass, is3D, rotationProperty} = props;
    this.updatesCount = data.updatesCount ?? 1;

    this.ConnectionClass = ConnectionClass ?? Matrix3Component;

    this.is3D = is3D ?? false;
    this.rotationProperty = rotationProperty ?? "rotation";

    this.gravity = data.gravity ?? {x: 0, y: 9.8};

    this.data = data;
    this.speed = data.speed ?? 1;

    this.eventBus.addEventListener(Component.EVENTS.ADD, this.onComponentAdded.bind(this));
    this.eventBus.addEventListener(Component.EVENTS.REMOVE, this.onComponentRemoved.bind(this));
  }

  /** Обновление контактов
   *
   */
  checkAddContactMaterials() {
    const {pairs} = this;

    pairs.forEach(([component]) =>
      component.contacts.forEach(({contactName, ...contactData}) => {

        pairs
          .filter(([p2Component]) => p2Component.name === contactName)
          .forEach(([p2Component]) => {

            const {contactsMaterials} = p2Component;
            const contactMaterialData = contactsMaterials.find(({component: checkComponent}) => checkComponent === component);

            if (!contactMaterialData) {

              const contactMaterial = new P2.ContactMaterial(
                p2Component.material,
                component.material,
                contactData
              );

              contactsMaterials.push({component, contactMaterial});
              this.world.addContactMaterial(contactMaterial);
            }
          });
      }));
  }

  /**
   * Удаление кконтакта из мира при удалении компонента
   */
  checkRemoveContactMaterials() {
    const {pairs} = this;
    pairs.forEach(([component]) => {
      for (let i = 0; i < component.contactsMaterials.length; i++) {
        const {component: targetComponent, contactMaterial} = component.contactsMaterials[i];
        const hasComponent = pairs.some(([component]) => targetComponent === component);
        if (hasComponent) continue;

        component.contactsMaterials.splice(i, 1);
        this.world.removeContactMaterial(contactMaterial);
        i--;
      }
    });
  }

  /**
   * Удаление тела из мира при удалении компонента
   * @param component
   * @param p2Body
   */
  onComponentRemoved({data: {component, component: {p2Body}}}) {
    if (!p2Body) return;

    this.world.removeBody(p2Body);

    this.updatePairs();
    this.checkRemoveContactMaterials(component);
  }

  /**
   * Добавление тела в мир при добавлении компонента
   * @param component
   * @param p2Body
   */
  onComponentAdded({data: {component, component: {p2Body}}}) {
    if (!p2Body) return;

    this.world.addBody(p2Body);

    this.updatePairs();
    this.checkAddContactMaterials(component);
  }

  /**
   * Обновление пар связей между компонентами ConnectionClass и компонентов с p2Body
   */
  updatePairs() {
    const {ConnectionClass} = this;
    this.pairs = this.allComponents
      .filter(({p2Body, entity}) => !!p2Body && entity)
      .map(p2Component => {
        const {entity} = p2Component;
        const matrixComponent = entity.children.find(component => component instanceof ConnectionClass);

        return [p2Component, matrixComponent];
      });
  }

  init() {
    super.init();

    const {
      data: {
        x,
        y,
        width,
        height,
        worldSettings = {},
      },
      gravity
    } = this;

    const world = this.world = new P2.World({
      gravity: [gravity.x, gravity.y],
      ...worldSettings
    });

    //Создание границ мира
    [
      [x - width / 2, y + height / 2, width, height],
      [x + width / 2, y - height / 2, width, height],
      [x + width * 1.5, y + height / 2, width, height],
      [x + width, y + height * 1.5, width / 3, height],
    ].forEach(([x, y, width, height]) => {
      const body = new P2.Body({
        position: [x, y],
        mass: 0
      });
      const box = new P2.Box({width, height});
      body.addShape(box);
      world.addBody(body);
    });

    this.listenCollision();
  }

  /**
   * Добавление слушателей на начало и конец коллизии
   */
  listenCollision() {
    this.world.on("beginContact", data => this.preContactAction({...data, type: CollisionSystem.EVENTS.COLLIDE_START}));
    this.world.on("endContact", data => this.preContactAction({...data, type: CollisionSystem.EVENTS.COLLIDE_END}));
  }


  preContactAction({bodyA, bodyB, contactEquations, type}) {
    const entityA = this.allComponents.find(c => c.p2Body === bodyA)?.entity;
    const entityB = this.allComponents.find(c => c.p2Body === bodyB)?.entity;
    const bodies = [bodyA, bodyB];
    const contactEquation = contactEquations?.find(one => bodies.includes(one.bodyA) && bodies.includes(one.bodyB)) ?? {};
    this.eventBus.dispatchEvent({
      type,
      data: {entityA, entityB, contactEquation}
    });
  }

  /**
   * Применение позиции\поворота в связанные компонента ConnectionClass
   * @param data
   */
  update(data) {
    super.update(data);
    const {is3D, rotationProperty} = this;
    const {deltaTime} = data;
    const {world, pairs, data: {maxSubSteps = 10}, speed} = this;
    const fixedTimeStep = PhysicsSystem.FPS / this.updatesCount;

    pairs.forEach(([p2Component, matrixComponent]) => {
      const {p2Body: {angle, position}} = p2Component;

      const [x, y] = position;

      matrixComponent.x = x;
      matrixComponent[is3D ? "z" : "y"] = y;

      matrixComponent[rotationProperty] = angle;
    });

    let i = this.updatesCount;

    while (i--)
      world.step(fixedTimeStep, deltaTime * fixedTimeStep * speed, maxSubSteps);
  }
}
