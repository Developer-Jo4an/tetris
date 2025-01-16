import Component from "../../../core/Component";

export class CollisionComponent extends Component {

  static EVENTS = {
    ON_COLLISION: "collision-component:collide"
  }

  type = "collisionComponent";


  constructor({eventBus, collision = {}}) {
    super({eventBus})
    const {collisionGroup, collisionList} = collision;
    this.collisionGroup = collisionGroup ?? "group";
    this.collisionList = collisionList ?? [];
  }


  checkEntrance(component) {
    if (!component) return false;
    return this.collisionList.includes(component.collisionGroup);
  }

}
