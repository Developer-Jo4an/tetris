import State from "../../../utils/scene/decorators/state/State";

export default class TetrisState extends State {
  constructor(data) {
    super(data);
  }

  onStateChanged(state) {
    super.onStateChanged(state);

    if (!this._controller.controllers) return;

    this.statePromise = Promise.all([
      this.statePromise,
      ...this._controller.controllers?.map(subController => {
        const asyncStateCallback = subController[`${state}Select`]?.call(subController);
        return asyncStateCallback ?? Promise.resolve();
      })
    ]);
  }
}
