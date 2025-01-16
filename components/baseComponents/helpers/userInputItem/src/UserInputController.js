import Item from "./Item";
import ScrollPlugin from "./plugins/ScrollPlugin";
import WindowSizePlugin from "./plugins/WindowSizePlugin";
import PositionPlugin from "./plugins/PositionPlugin";
import TransformPlugin from "./plugins/TransformPlugin";
import ScrollParallax from "./plugins/ScrollParallax";
import CSSPlugin from "./plugins/CSSPlugin";
import CursorPlugin from "./plugins/CursorPlugin";
import MousePlugin from "./plugins/MousePlugin";
import ScrollFollowPlugin from "./plugins/ScrollFollowPlugin";

let cUID = 0;

export default class UserInputController {

  static get instance() {
    if (!this._instance)
      this._instance = new UserInputController();

    return this._instance;
  }

  static _instance;

  /**
   * drawIO link https://drive.google.com/file/d/1MtHIzQC1IKaQJlThttOeLrBbYaqWf4hP/view?usp=sharing
   *
   */
  static PLUGINS = {
    windowSize: {
      Cls: WindowSizePlugin,
      subPlugins: []
    },
    scroll: {
      Cls: ScrollPlugin,
      subPlugins: []
    },
    position: {
      Cls: PositionPlugin,
      subPlugins: ["windowSize", "scroll"]
    },
    transform: {
      Cls: TransformPlugin,
      subPlugins: []
    },
    scrollParallax: {
      Cls: ScrollParallax,
      subPlugins: ["transform", "position", "css"]
    },
    css: {
      Cls: CSSPlugin,
      subPlugins: []
    },
    cursor: {
      Cls: CursorPlugin,
      subPlugins: ["position", "transform", "css", "mouse"]
    },
    mouse: {
      Cls: MousePlugin,
    },
    scrollFollow: {
      Cls: ScrollFollowPlugin,
      subPlugins: ["scroll", "transform", "css", "mouse"]
    }
  };

  items = [];

  plugins = [];

  constructor() {
    this.update = this.update.bind(this);

    requestAnimationFrame(this.update);
  }

  init({ignoreItem, ref, items, queryItems, ...rest}) {
    cUID++;

    const componentID = cUID;
    const addingItems = [];

    if (!ignoreItem)
      addingItems.push({...rest, ref, componentID})

    if (Array.isArray(items))
      items.map(item => addingItems.push({...item, componentID}));
    if (typeof queryItems === "string") {
      ref.current
        .querySelectorAll(queryItems)
        .forEach(element => {
          addingItems.push({...rest, ...element.dataset, componentID, ref: {current: element}});
        });
    }

    addingItems.forEach(itemData => this.add(itemData, addingItems));

    return componentID;
  }

  destroy(componentID) {
    const {items} = this;
    items.forEach(item => {
      if (item.componentID === componentID)
        this.remove(item.uid)
    });
  }

  update() {
    this.plugins.forEach(plugin => plugin.update());

    this.plugins.forEach(plugin => plugin.resetChanged());

    requestAnimationFrame(this.update);
  }

  add(settings, addingItems = []) {
    cUID++;

    const item = new Item({uid: cUID, settings});
    this.items.push(item);

    this.checkPlugins(item);
    this.plugins.forEach(plugin => plugin.informSubscriber(item));
    return cUID;
  }

  remove(uid) {
    const {items, plugins} = this;
    const item = items.find(({uid: itemUid}) => itemUid === uid);
    if (!item) return;

    plugins.forEach(plugin => plugin.unsubscribe(item));
    items.splice(items.indexOf(item), 1);
  }

  checkPlugins(item) {
    const {settings} = item;

    Object.keys(UserInputController.PLUGINS)
      .filter(pluginName => settings.hasOwnProperty(pluginName))
      .forEach(pluginName => {
        this.registerPlugin(pluginName, item);

        this.getPluginByName(pluginName).subscribe(item);
      });
  }

  registerPlugin(name, item) {

    const {Cls, subPlugins} = UserInputController.PLUGINS[name];

    subPlugins && subPlugins.forEach(pluginName => {
      this.registerPlugin(pluginName, item);
      this.getPluginByName(pluginName).subscribe(item);
    });

    if (!this.getPluginByName(name))
      this.plugins.push(new Cls({items: this.items}));

    this.sortPlugins();
  }

  getPluginByName(name) {
    return this.plugins.find(({name: pluginName}) => name === pluginName);
  }

  sortPlugins() {
    this.plugins.sort((a, b) => a.order - b.order);
  }
}
