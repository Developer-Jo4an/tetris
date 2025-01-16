import Preset from "./Preset";
/**
 * example:
 * this.inputController = new InputController({
 *       eventBus,
 *       basePlugins: [new SwipePlugin(), new KeyboardPlugin()]
 *     });
 *
 *     const swipePlugin = this.inputController.getPluginByName("swipe");
 *     swipePlugin.attach(this.canvas);
 *     const keyBoardPlugin = this.inputController.getPluginByName("keyboard");
 *     keyBoardPlugin.attach(window);
 *
 *     this.inputController.addPreset({
 *       name: "mainPreset",
 *       actions: [
 *         {
 *           name: "up",
 *           keyboard: {
 *             keys: [
 *               {
 *                 keyCode: 38,
 *               },
 *               {
 *                 keyCode: 87,
 *               },
 *               {
 *                 keyCode: 32,
 *               }
 *             ]
 *           },
 *           swipe: {
 *             direction: 1,
 *             axis: "y",
 *           }
 *         },
 *       ]
 *     })
 */
export default class InputController {

  _presets = {};

  _basePlugins = [];

  constructor({eventBus, basePlugins} = {}) {
    this.eventBus = eventBus;
    this._basePlugins = basePlugins ?? this._basePlugins;
  }

  getActionData(presetName, actionName) {
    return this._presets[presetName]?.getActionByName(actionName);
  }

  getPluginByName(name) {
    return this._basePlugins.find(({name: pluginName}) => name === pluginName);
  }

  addPreset(presetData) {
    if (!presetData.name) return console.log("preset's name is not defined");
    const {eventBus} = this;
    const preset = new Preset(presetData, eventBus);
    this._presets[presetData.name] = preset;
    this.checkActions(preset.actions);
  }

  checkActions(actions) {
    const {_basePlugins} = this;
    actions.forEach(action => {
      _basePlugins.forEach(plugin => {
        if (plugin.checkAction(action))
          plugin.addAction(action)
      })
    });
  }
}

/**
 * presetExample:
 * {
  swipeDesktopActive: true,
  name: "presetName1",
  actions: [
    {
      name: "left",
      text: "left",
      keyboard: {
        keys: [
          {
            keyCode: 37
          }
        ]
      },
      swipe: {
        direction: 1,
        axis: "x"
      }
    }
  ]
 * }
 */
