import Matter from "matter-js";
import System from "../core/System";
import Component from "../core/Component";
import Matrix3Component from "../base/components/transform/Matrix3Component";
import {getIsDebug} from "../../debug/getIsDebug";

export default class PhysicsSystem extends System {

  pairs = [];

  constructor(data) {
    super(data);

    this.beforeUpdate = this.beforeUpdate.bind(this);

    this.updatesCount = data.updatesCount ?? 1;

    this.data = data;

    this.eventBus.addEventListener(Component.EVENTS.ADD, this.onComponentAdded.bind(this));
    this.eventBus.addEventListener(Component.EVENTS.REMOVE, this.onComponentRemoved.bind(this));
  }

  onComponentRemoved({data: {component: {matterBody}}}) {
    if (!matterBody) return;
    Matter.World.remove(this.world, matterBody);

    this.updatePairs();
  }

  onComponentAdded({data: {component: {matterBody}}}) {
    if (!matterBody) return;
    Matter.World.add(this.world, matterBody);

    this.updatePairs();
  }

  updatePairs() {
    this.pairs = this.allComponents
      .filter(({matterBody, entity}) => !!matterBody && entity)
      .map(matterComponent => {
        const {entity} = matterComponent;
        const matrixComponent = entity.children.find(component => component instanceof Matrix3Component);

        return [matterComponent, matrixComponent]
      })
  }

  init() {
    super.init();

    const {
      data: {
        x,
        y,
        width,
        height,
        engine = {}
      }
    } = this;

    this.mEngine = Matter.Engine.create(engine);

    Matter.Events.on(this.mEngine, 'beforeUpdate', this.beforeUpdate);

    Matter.Composite.add(this.world, [
      Matter.Bodies.rectangle(x - width / 2, y + height / 2, width, height, {isStatic: true}),
      Matter.Bodies.rectangle(x + width / 2, y - height / 2, width, height, {isStatic: true}),
      Matter.Bodies.rectangle(x + width * 1.5, y + height / 2, width, height, {isStatic: true}),
      Matter.Bodies.rectangle(x + width / 2, y + height * 1.5, width, height, {isStatic: true})
    ]);

    if (getIsDebug())
      this.initMatterDebugRender();
  }

  beforeUpdate() {
    const {pairs} = this;

    pairs.forEach(([matterComponent]) => {
      const {matterBody} = matterComponent;

      if (!matterBody.maxSpeed) return;

      const currentSpeed = matterBody.velocity.y ** 2 + matterBody.velocity.x ** 2;
      if (currentSpeed > matterBody.maxSpeed ** 2) {
        const scale = matterBody.maxSpeed / Math.sqrt(currentSpeed)
        Matter.Body.setVelocity(matterBody, {
          x: matterBody.velocity.x * scale, y: matterBody.velocity.y * scale
        });
      }
    });
  }

  initMatterDebugRender() {
    const render = Matter.Render.create({
      element: document.body,
      engine: this.mEngine,
      bounds: {
        min: {x: -500, y: -500},
        max: {x: 500, y: 500}
      },
      options: {
        hasBounds: true,
        width: 1000,
        height: 1000
      }
    });
    render.canvas.style.position = "fixed";
    render.canvas.style.zIndex = "10000";
    render.canvas.style.opacity = "0.5";
    render.canvas.style.pointerEvents = "none";
    Matter.Render.run(render);

    const mouse = Matter.Mouse.create(render.canvas),
      mouseConstraint = Matter.MouseConstraint.create(this.mEngine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });

    Matter.Composite.add(this.mEngine.world, mouseConstraint);

    render.mouse = mouse;
  }

  get world() {
    return this.mEngine.world;
  }

  update(data) {
    super.update(data);

    const {mEngine, pairs} = this;

    pairs.forEach(([matterComponent, matrixComponent]) => {
      matrixComponent.x = matterComponent.matterBody.position.x;
      matrixComponent.y = matterComponent.matterBody.position.y;
      matrixComponent.rotation = matterComponent.matterBody.angle;

    });

    let i = this.updatesCount;

    while (i--)
      Matter.Engine.update(mEngine, 1000 / 60 / this.updatesCount);

  }
}
