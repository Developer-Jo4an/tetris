export function pixiControllerUnload(pixiController) {
  if (!global.PIXI) return console.log("PIXI is not defined");
  if (!pixiController) return console.log("pixiController is not defined");

  pixiController.ticker.stop();
  clearTicker(PIXI.Ticker.shared);
  PIXI.utils.clearTextureCache();

  clearAnimator();
}


function clearAnimator() {
  if (!PIXI.animate?.Animator) return;
  const {animate: {Animator, AnimatorTimeline}} = PIXI;
  Animator._timelines.length = 0;
  AnimatorTimeline._pool.length = 0;
  globalThis.__PIXI_APP__ = null;
}

function clearTicker(ticker) {
  let listener = ticker._head.next;
  while (listener) {
    listener = listener.destroy(true);
  }
}


/**
 * example in PixiWrapper:
 onUnload() {
    pixiControllerUnload(this.controller);
    destroyDataInWrapper({dataWrapper: this});
    destroyDataInWrapper({dataWrapper: spritesFactory.storage});
    destroyDataInWrapper({dataWrapper: itemsFactory.storage});
    destroyDataInWrapper({dataWrapper: FPSMeter.listeners});
    PixiWrapper._instance = null;
  }
 **/
