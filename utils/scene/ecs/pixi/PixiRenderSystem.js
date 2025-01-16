import System from "../core/System";
import Component from "../core/Component";
import Matrix3Component from "../base/components/transform/Matrix3Component";

export default class PixiRenderSystem extends System {

  pairs = [];

  constructor(data) {
    super(data);

    this.data = data;

    this.eventBus.addEventListener(Component.EVENTS.ADD, this.onComponentAdded.bind(this));
    this.eventBus.addEventListener(Component.EVENTS.REMOVE, this.onComponentRemoved.bind(this));
  }

  onComponentRemoved({data: {component: {pixiObject}}}) {
    if (!pixiObject) return;
    this.updatePairs();
  }

  onComponentAdded({data: {component: {pixiObject}}}) {
    if (!pixiObject) return;
    this.updatePairs();
  }

  updatePairs() {
    this.pairs = this.allComponents
      .filter(({pixiObject, entity}) => !!pixiObject && entity)
      .map(pixiComponent => {
        const {entity} = pixiComponent;
        const matrixComponent = entity.children.find(component => component instanceof Matrix3Component);

        return [matrixComponent, pixiComponent]
      })
  }

  update(data) {
    super.update(data);

    const {pairs} = this;

    pairs.forEach(([matrixComponent, pixiComponent]) => {
      pixiComponent.pixiObject.x = matrixComponent.x;
      pixiComponent.pixiObject.y = matrixComponent.y;
      pixiComponent.pixiObject.rotation = matrixComponent.rotation;
      pixiComponent.pixiObject.scale.x = matrixComponent.scaleX;
      pixiComponent.pixiObject.scale.y = matrixComponent.scaleY;
    });
  }
}
