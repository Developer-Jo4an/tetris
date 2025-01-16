const tweens = [];
const requestAnimationFrame = global?.window?.requestAnimationFrame || function () {
};

function to(object, to, duration, onComplete) {
  const from = {};
  Object.keys(to).forEach(key => from[key] = object[key] || 0);
  fromTo(object, from, to, duration, onComplete);
}

function fromTo(object, from, to, duration, onComplete) {
  tweens.push(new SimpleTween({
    object, from, to, duration, onComplete
  }));
}

function killTweensOf(object) {
  tweens
    .filter(({object: tweenObject}) => tweenObject === object)
    .forEach(tween => tweens.splice(tweens.indexOf(tween), 1));
}

class SimpleTween {
  constructor({object, from, to, duration, onComplete}) {
    this.object = object;
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.onComplete = onComplete;

    this.progress = 0;
  }

  update(delta) {
    const {duration, object, from, to, onComplete} = this;
    this.progress = Math.min(1, Math.max(this.progress + delta / (duration * 1000), 0));
    Object.keys(from).forEach(key => {
      object[key] = from[key] + (to[key] - from[key]) * this.progress;
    });

    if (this.progress === 1) {
      if (typeof onComplete === "function")
        onComplete();
      tweens.splice(tweens.indexOf(this), 1);
    }
  }
}

let now = Date.now();

function update() {
  const cNow = Date.now();
  const deltaTime = cNow - now;
  now = cNow;

  tweens.forEach(tween => tween.update(deltaTime));

  requestAnimationFrame(update);
}

requestAnimationFrame(update);

export {to, fromTo, killTweensOf};

