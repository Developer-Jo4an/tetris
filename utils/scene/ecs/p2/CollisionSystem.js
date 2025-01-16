import System from "../core/System";

//Система для коллизий
export class CollisionSystem extends System {

  static EVENTS = {
    COLLIDE_START: "collision:collide-start",
    COLLIDE_END: "collision:collide-end",
    ON_COLLISION: "collision:on-collision",
  }

  _active = false;

  constructor(props) {
    super(props);
    this.eventBus.addEventListener(CollisionSystem.EVENTS.COLLIDE_START, this.onCollide.bind(this));
  }


  onCollide({data: {entityA, entityB, ...rest}}) {
    if (!this._active || !entityA || !entityB) return;

    const collisionA = entityA.getComponentByType("collisionComponent");
    const collisionB = entityB.getComponentByType("collisionComponent");

    if (!collisionA || !collisionB) return;

    if (collisionA.checkEntrance(collisionB))
      this.onCollision(entityA, entityB, rest);

    if (collisionB.checkEntrance(collisionA))
      this.onCollision(entityB, entityA, rest);
  }

  /**
   *
   * @param entityA - кто столкнулся
   * @param entityB - с кем столкнулся
   * @param data
   */
  onCollision(entityA, entityB, data = {}) {
    const {isRepeat} = this.preventRepeat(entityA, entityB)
    if (!isRepeat)
      this.eventBus.dispatchEvent({type: CollisionSystem.EVENTS.ON_COLLISION, data: {entityA, entityB, ...data}});
  }


  preventRepeat(entityA, entityB) {
    if (!entityA._collidingElements)
      entityA._collidingElements = [];

    const isRepeat = entityA._collidingElements.includes(entityB);

    if (isRepeat)
      clearTimeout(entityA._collidingTimeout);
    else entityA._collidingElements.push(entityB);

    entityA._collidingTimeout = setTimeout(() => {
      const index = entityA._collidingElements.indexOf(entityB);
      if (index !== -1)
        entityA._collidingElements.splice(index, 1);
    }, 100);

    return {isRepeat};
  }

  set active(value) {
    this._active = value;
  }

  get active() {
    return this._active;
  }


  configure() {
    this.active = true;
  }
}


