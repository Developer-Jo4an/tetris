const SEC = 1000;
const MINUTE = 60 * SEC;

const LISTEN_CONTROLS = [
  {
    event: "click",
    target: null,
    callback: "_checkClickFrequency"
  }
];

export default class AnalyticsController {

  static GAME_NAME = "Wordly";

  static _data = {
  };

  static onFrequentClicksGameBg() {
    this.dispatchGameEvent("FrequentClicksGameBg");
  }

  static onGameStart() {
    this.dispatchGameEvent("GameStart");
  }

  static onUserDidntGuess() {
    this.dispatchGameEvent("UserDidntGuess");
  }

  static onEveryFifthLevel() {
    this.dispatchGameEvent("EveryFifthLevel");
  }

  static getEventCategory(eventName) {
    return `Game-${AnalyticsController.GAME_NAME}-${eventName}`;
  }

  static dispatchGameEvent(eventName) {
    logger("dispatchGameEvent:", "\n", this.getEventCategory(eventName));
    const target = this._getWindowTarget();
    target.dataLayer?.push({
      'event': 'auto-event',
      'event-name': this.getEventCategory(eventName)
    });
  }

  static listenGameFieldClick(eventTarget) {
    this._listeningControls.forEach(data => {
      if (!data.target)
        data.target = eventTarget;

      if (!data.target) return logger(`AnalyticsController: no target for event: ${data.event}`);
      const callback = typeof this[data.callback] === "function" && this[data.callback];
      callback && data.target.addEventListener(data.event, callback.bind(this, data));
    })
  }

  static quitListenFieldClick() {
    this._listeningControls.forEach(data => {
      const callback = typeof this[data.callback] === "function" && this[data.callback];
      data.target && callback && data.target.removeEventListener(data.event, callback.bind(this, data));
    })
  }

  static get _listeningControls() {
    return LISTEN_CONTROLS;
  }

  static _getWindowTarget() {
    return window.top ?? window;
  }

  static _checkClickFrequency() {
    this._checkSomeFrequency({name: "clicks", EVENT_TYPE: "FrequentClicksGameBg"});
  }

  static _checkKeyboardFrequency({options = []} = {}, event) {
    const checkListening = options.find(option => option.keyCode === event.keyCode);
    if (!checkListening) return;
    this._checkSomeFrequency({name: "keyboard", EVENT_TYPE: this.EVENTS.FREQUENT_KEYBOARD});
  }

  /**
   *
   * @param name  [uniq]
   * @param EVENT_TYPE
   */
  static _checkSomeFrequency({name = "SomeFrequency", EVENT_TYPE = `EVENT_TYPE`}) {
    const {_data} = this;

    const lastTimeName = `last${name}Time`;
    const countName = `${name}Count`;
    const dispatchedName = `${name}HasDispatched`;

    if (!_data[lastTimeName]) {
      _data[lastTimeName] = Date.now();
      _data[countName] = 0;
    }
    const delta = Date.now() - _data[lastTimeName];

    if (delta < SEC) _data[countName]++;
    else {
      _data[countName] = 1;
      _data[lastTimeName] = Date.now();
      _data[dispatchedName] = false;
    }

    if (_data[countName] > 3 && !_data[dispatchedName]) {
      this.dispatchGameEvent(EVENT_TYPE);
      _data[dispatchedName] = true;
    }
  }
}

if (global.window)
  AnalyticsController.listenGameFieldClick(global.window.document.body);

function logger() {
  findGetParameter("analytics") && console.log(...arguments);
}

function findGetParameter(parameterName) {
  let result = null,
    tmp = [];
  location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
}
