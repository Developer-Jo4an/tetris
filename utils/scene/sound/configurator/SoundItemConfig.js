import {getRandomFromList} from "../../utils/data/random/getRandomFromRange";

export default class SoundItemConfig {

  name;

  states;

  requiredFirstLoad;

  constructor({name, options = [], states = [], requiredFirstLoad = false, src, ...props}) {
    this.name = name;
    this.requiredFirstLoad = requiredFirstLoad;
    this.states = states;
    this.src = src;
    this.props = props ?? {};


    this.options = options.map((data, i) => ({...data, name: `${name}_${i + 1}`}));

    if (this.src)
      this.options.push({src: this.src, name: name, ...props});

    // console.log(this);
  }


  get manifest() {
    return this.options.map(data => ({
      name: data.name,
      path: data.src,
      data
    }));
  }

  pause() {
    this.options.forEach(option => {
      soundManager.onPause(option.name, option)
    })
  }

  play() {
    const playOne = getRandomFromList(this.options);
    const {name, ...props} = playOne;
    // console.log("onPlay props", playOne);
    if (!soundManager.items[name]) return;

    soundManager.onPlay(name, {
      parallel: false,
      isBackground: true,
      animationStart: true,
      loop: true,
      ...props
    });
  }


  playSingle() {
    const playOne = getRandomFromList(this.options);
    const {name, ...props} = playOne;
    // console.log("playSingle props", playOne);
    if (!soundManager.items[name]) return;
    soundManager.onPlay(name, {parallel: false, animationStart: true, ...props});
  }
}
