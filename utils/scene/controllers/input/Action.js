export default class Action {

  presetName = "unknownPreset";

  name = "unknownAction";

  _active = false;

  _enabled = true;

  counterActions = [];

  constructor(actionData, eventBus) {
    this.name = actionData.name || this.name;
    this._data = actionData;
    this.eventBus = eventBus;
    this.counterActions = actionData.counterActions || [];
  }

  get data() {
    return this._data;
  }

  set enabled(enabled) {
    if (this.enabled === enabled) return;
    this._enabled = enabled;

    this.trigger("enabled-change", { enabled: this.enabled });
  }

  get enabled() {
    return this._enabled;
  }

  set active(active) {
    if (this.active === active) return;
    this._active = active;

    this.trigger("active-change", { active: this.active });
  }

  get active() {
    return this._active;
  }

  trigger(action, data) {
    if (!this.eventBus) return;
    const event = { type: `action:${ action }`, action: this, data };
    this.eventBus.dispatchEvent(event);
  }
}
