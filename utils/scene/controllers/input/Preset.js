import Action from "./Action";

export default class Preset {

  name = "unknownPreset";

  _actions;

  _actionCache = {};

  constructor(data, eventBus) {
    this.name = data.name;
    this._data = data;
    this.eventBus = eventBus;

    this._actions = data.actions.map(this.initAction);

    eventBus.addEventListener("action:active-change", this.onActiveChange);
  }

  getActionByName(name) {
    return this._actionCache[name] ||
      (this._actionCache[name] = this._actions.find(({ name: actionName }) => name === actionName));
  }

  onActiveChange = ({ data: { active }, action: { counterActions } }) => {
    if (active) {
      counterActions.forEach(actionName => {
        const counterAction = this.actions.find(({ name }) => name === actionName);
        if (counterAction)
          counterAction.active = false;
      });
    }
  };

  get actions() {
    return this._actions;
  }

  initAction = (actionData) => {
    const { eventBus } = this;
    const action = new Action(actionData, eventBus);
    action.presetName = this.name;
    return action;
  };
}
