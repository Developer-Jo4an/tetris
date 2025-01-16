import BezierEasing from "bezier-easing";

export class CameraShakeTraumaBehavior {

  /**
   *
   * @param {CameraShakeBehavior} shakeBehavior
   * @param {number} decay amount by which trauma decays per second
   */
  constructor({
                shakeBehavior,
                decay = 1,
              }) {

    this.decay = decay;
    this.trauma = 0;

    this.shakeBehavior = shakeBehavior;

    this.formula = BezierEasing(0, 0.1, 0.1, 1);
  }

  tick(timeDelta) {
    const shake = this.formula(Math.max(0, Math.min((this.trauma + 1) / 2, 1)));

    this.trauma = this.trauma + timeDelta * this.decay;

    this.shakeBehavior.strength = shake;
  }
}
