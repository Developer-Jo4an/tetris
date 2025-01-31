export default class BaseTetrisController {
  constructor(data) {
    this.stateChanged = this.stateChanged.bind(this);

    this.storage = data.storage;
    this.stage = data.stage;
    this.canvas = data.canvas;
    this.renderer = data.renderer;
    this.eventBus = data.eventBus;
    this.state = data.state;
    this.level = data.level;

    this.eventBus.addEventListener("state-adapter:state-changed", this.stateChanged);
  }

  stateChanged({data: {state}}) {
    this.state = state;
  }

  init() {

  }

  update(milliseconds, deltaTime) {

  }
}
