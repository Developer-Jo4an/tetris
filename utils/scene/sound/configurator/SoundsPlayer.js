import SoundItemConfig from "./SoundItemConfig";

/**
 * Что умеет делать и для чего нужен?
 *
 * 1. Можно для каждого звука указать список стейтов, когда звук будет проигран
 * 2. Единый объект с настройками 'SETTINGS'. Пример ниже
 * 3. Есть флаг 'requiredFirstLoad', отвечающий за обязательную загрузку, если он не выбран, то загрузка ленивая
 * 4. Можно указать список 'options', тогда будет играться случайный из списка
 *
 * Использования:
 *
 * SoundPlayer.setSettings(SETTINGS);
 * SoundPlayer.load();
 * SoundPlayer.onStateChange(state);
 * SoundPlayer.playSingle(name);
 */
export default class SoundPlayer {

  _items;

  _bgSounds;

  /**
   * Пример конфигурации 'SETTINGS'
   * {
   * screens: {
   *   requiredFirstLoad: true,
   *   states: Object.keys(PAGE_STATES).filter(state => state !== "game"),
   *   src: "sounds/musicScreenLoop.mp3"
   * },
   * game: {
   *   states: ["game"],
   *   volume: 1,
   *   options: [
   *     {name: "game1", src: "sounds/musicGameLoop.mp3"},
   *     {name: "game2", src: "sounds/musicGameLoop2.mp3"},
   *     {name: "game3", src: "sounds/musicGameLoop3.mp3"},
   *   ],
   * },
   * nature: {
   *   volume: 1,
   *   states: ["game"],
   *   src: "sounds/nature.mp3"
   * },
   * win: {
   *   src: "sounds/win.mp3" //for single play
   * }
   * }
   */
  _settings;


  static setSettings(settings) {
    this._settings = settings;
  }

  static set bgSounds(list) {
    if (this._bgSounds?.length && this._bgSounds?.every((one, i) => one === list[i])) return;

    const pauseSounds = this._bgSounds?.filter(sound => !list.includes(sound)) || [];
    const playSounds = list.filter(sound => !this._bgSounds?.includes(sound)) || [];

    pauseSounds.forEach(sound => this.items[sound]?.pause());
    playSounds.forEach(sound => this.items[sound]?.play());
    // console.log("pauseSounds", pauseSounds);
    // console.log("playSounds", playSounds);
    this._bgSounds = list;
  }

  static get bgSounds() {
    return this._bgSounds;
  }

  static get items() {
    return this._items;
  };

  static onStateChange(state = this.prevState) {
    this.prevState = state;
    if (!global.soundManager) return;
    this.bgSounds = Object.keys(this.items).filter(key => this.items[key].states?.includes(state));
  }

  static playSingle(name) {
    if (!global.soundManager) return;
    this.items[name]?.playSingle();
  }


  static async load() {
    const {soundManager} = await import ("../SoundManager");
    global.soundManager = soundManager;
    soundManager.muted = false;

    const required = [];
    const lazy = [];
    this._items = createItems(this._settings);

    Object.values(this._items)
      .forEach(soundItem => {
        const list = soundItem.requiredFirstLoad ? required : lazy;
        soundItem.manifest.forEach(item => list.push(item));
      });

    // console.log("required", required);
    // console.log("lazy", lazy);

    await soundManager.loadList(required);
    soundManager.loadList(lazy);
    window.addEventListener("click", () => this.onStateChange(), {once: true})
  }
}


function createItems(_settings) {
  const items = {};
  for (let key in _settings) {
    items[key] = new SoundItemConfig({..._settings[key], name: key});
  }
  return items;
}
