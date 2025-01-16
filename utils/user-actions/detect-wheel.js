export function initMouseWheel({
                                 onScroll, onScrollComplete,
                                 onBeforeCheck, onAfterCheck,
                                 onWaitForDecayCallback,

                                 maxCompleteTimeoutDelay = 200,
                                 checkTimeout = 300,
                                 emulationOnly = false,
                                 target = window
                               } = {}) {
  let prev_time = 0;
  let prev_deltaY = 0;
  let prev_deltaY_abs = 0;
  let prev_direction = 0;
  let max_deltaY = 0;
  let max_deltaY_time = 0;

  let normal_timeout = 0;
  let wait_for_deacy_timeout;
  let event_count = 0;

  let isScrollTriggered = false;

  let current_direction = 0;

  target.addEventListener("wheel", onWheel, {passive: false});

  function onWheel(e, isEmulation) {
    if (emulationOnly && !isEmulation) return;
    let _deltaY =
      typeof e.deltaY === "undefined"
        ? -e.wheelDelta
        : e.deltaY;
    let _deltaY_abs = Math.abs(_deltaY);
    let _direction = (current_direction = _deltaY > 0 ? 1 : -1);
    let _time = Date.now();
    let _delta_time = _time - prev_time;

    if (max_deltaY === 0) {
      // пик не достигнут

      clearTimeout(normal_timeout);
      normal_timeout = setTimeout(onNormalTimeout, maxCompleteTimeoutDelay);

      if (_deltaY_abs < prev_deltaY_abs) {
        // достигли пика - записали его значение
        // $("#output2").text( "max of scroll reached" );
        max_deltaY = prev_deltaY_abs;
        max_deltaY_time = _time;
        onMouseWheelComplete(_direction);
      }
    } else {
      // если пик достигнут то ждем...

      clearTimeout(normal_timeout);

      if (
        _deltaY_abs > prev_deltaY_abs + 3 &&
        _time - max_deltaY_time > checkTimeout
      ) {
        // ... наростания в случае повторного скролла но не чаще 200мсек...
        max_deltaY = 0;
      }

      clearTimeout(wait_for_deacy_timeout);
      wait_for_deacy_timeout = setTimeout(
        onWaitForDecay,
        maxCompleteTimeoutDelay
      );
    }
    // }

    // ordinary mouse wheel

    prev_direction = _direction;
    prev_deltaY_abs = _deltaY_abs;
    prev_time = _time;



    if (typeof onBeforeCheck == "function")
      onBeforeCheck(e, current_direction);

    if (onScroll && !isScrollTriggered) {
      isScrollTriggered = true;
      onScroll(e, current_direction);
    }

    if (typeof onAfterCheck == "function")
      onAfterCheck(e, current_direction);

  }

  function onNormalTimeout() {
    onWaitForDecay();
    onMouseWheelComplete();
  }

  function onWaitForDecay() {
    prev_deltaY = 0;
    max_deltaY = 0;
    prev_direction = 0;
    if (typeof onWaitForDecayCallback === "function")
      onWaitForDecayCallback();
  }

  function onMouseWheelComplete() {
    event_count++;
    if (onScrollComplete) onScrollComplete(current_direction, event_count);

    isScrollTriggered = false;
  }

  return {onWheel};
}
