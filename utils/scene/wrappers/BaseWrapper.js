import State from "../decorators/state/State";
import {EventDispatcher} from "../events/EventDispatcher";
import SceneController from "../containers/SceneController";
import {CustomData} from "../data/CustomData";

export default class BaseWrapper {

  decorators = [State];

  eventBus = new EventDispatcher();

  storage = new CustomData();

  readyPromise;

  readyResolver;

  loadingPromise;

  loadingResolver;


  constructor() {

    this.onLoad = this.onLoad.bind(this);

    this.readyPromise = new Promise(resolve => this.readyResolver = resolve);
    this.loadingPromise = new Promise(resolve => this.loadingResolver = resolve);

    this.eventBus.addEventListener("scene-controller:loaded", this.onLoad);
  }

  init() {
    if (this.controller) return;

    this.controller = this.initController();

    this.decorators.forEach((Decorator) => new Decorator(this));
    this.readyResolver({
      events: this.eventBus
    });

    this.controller.init();
  }

  onLoad() {
    this.loadingResolver();
  }

  appendContainer(container) {
    this.controller.appendContainer?.(container);
  }

  initController() {
    const {eventBus, storage} = this;

    return new SceneController({eventBus, storage});
  }
}
