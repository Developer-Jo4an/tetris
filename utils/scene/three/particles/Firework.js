import System, {
  Emitter,
  Rate,
  Span,
  Position,
  Mass,
  Gravity,
  Life,
  RadialVelocity,
  Body,
  Vector3D,
  Rotate,
  Scale,
  Color,
  SphereZone,
  ease,
  SpriteRenderer
} from "three-nebula";
import AssetsManager from "../../loader/plugins/AssetsManager";

export default class Firework {

  isDestroyed = false;

  constructor({scene}) {


    const system = new System();

    const renderer = new SpriteRenderer(scene, THREE);


// add the emitter and a renderer to your particle system
    this.particleSystem = system
      .addEmitter(this.createEmitter(true))
      .addEmitter(this.createEmitter())
      .addRenderer(renderer);

    this.update();
  }

  createEmitter(isLeft) {
    const emitter = new Emitter();
    const colors = ["#42cbfe", "#d04792", "#01dc7a", "#fdb004", "#47ceff"];
    const direction = {x: 0.5, y: 1, z: 0};

    emitter
      .setRate(new Rate(new Span(8, 32), new Span(0.01)))
      .setInitializers([
        new Body(this.createSprite()),
        new Mass(1),
        new Life(1, 3),
        new Position(new SphereZone(1)),
        new RadialVelocity(8, new Vector3D(isLeft ? direction.x : -direction.x, direction.y, direction.z), 40),
      ])
      .addBehaviours([
        new Rotate("random", "random"),
        new Scale(new Span(0.08, 0.1), 0),
        new Gravity(0.06),
        new Color(
          colors,
          colors, Infinity, ease.easeOutSine),
      ])
      .setPosition({x: isLeft ? -2 : 2, y: 0, z: 0})
      .emit(0);

    return emitter;
  }

  createSprite() {
    const material = new THREE.SpriteMaterial({
      map: AssetsManager.getAssetFromLib("particle", "texture"),
      transparent: true,
    });
    return new THREE.Sprite(material);
  }

  play() {
    const duration = 0.1;
    const waitDuration = 1;

    this.particleSystem.emitters.forEach(emitter => emitter.emit(duration));

    return new Promise(resolve => setTimeout(resolve, (waitDuration + duration) * 1000));

  }

  destroy() {
    this.isDestroyed = true;
  }

  update() {
    if (this.isDestroyed) return;
    this.particleSystem.update();
    requestAnimationFrame(() => this.update());
  }
}
