import BaseDecorator from "../BaseDecorator";

export default class State extends BaseDecorator {

  _state = "";

  _controller;

  _eventBus;

  statePromise;

  constructor(wrapper) {
    super();
    const {controller, eventBus} = wrapper;

    this.onRequestState = this.onRequestState.bind(this);
    this.onApplyState = this.onApplyState.bind(this);
    this.update = this.update.bind(this);

    this._controller = controller;
    this._eventBus = eventBus;
    this._needSendRequest = !wrapper.freeStates;


    this.define(wrapper, "statePromise", () => this.statePromise);
    this.define(controller, "state", () => this._state);

    eventBus.addEventListener("request-state", this.onRequestState);
    eventBus.addEventListener("apply-state", this.onApplyState);

    this.state = "idle";
  }


  onRequestState({data: {state}}) {
    this.requestState(state);
  }

  onApplyState({data}) {
    this.changeState(data.state);
    data.promise = this.statePromise;
  }

  update() {
    this._controller.update();

    requestAnimationFrame(this.update);
  }

  requestState(state) {
    if (this._needSendRequest)
      this._eventBus.dispatchEvent({type: "state-adapter:request", data: {state}})
    else
      this.changeState(state);
  }

  changeState(state) {
    this.state = state;
  }

  set state(state) {
    if (this._state === state) return;
    this._state = state;

    this.onStateChanged(this._state);
  }

  onStateChanged(state) {
    this._eventBus.dispatchEvent({type: "state-adapter:state-changed", data: {state}})
    this.statePromise = this._controller[`${state}Select`]?.call(this._controller) ?? Promise.resolve();
  }
}
