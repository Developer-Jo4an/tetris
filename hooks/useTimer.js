import {useCallback, useEffect, useState, useMemo} from "react";
import {timeToString} from "../utils/data/time";

export default function useTimer(total = 10_000, onTimeout, settings = {}) {
  const [time, setTime] = useState(total);
  const [paused, setPaused] = useState(true);

  const timerData = useMemo(() => ({timeoutID: null}), []);

  const pause = useCallback(() => setPaused(true), [setPaused]);
  const resume = useCallback(() => setPaused(false), [setPaused]);

  const start = useCallback(() => {
    setPaused(false);
    setTime(total);
  }, [total]);

  const reset = useCallback(() => {
    setPaused(true);
    setTime(total);
  }, [total]);

  useEffect(() => {
    setPaused(true);
    setTime(total);
  }, [total]);

  useEffect(() => {
    if (paused)
      clearTimeout(timerData.timeoutID)
  }, [paused]);

  useEffect(() => {
    if (!paused) {
      clearTimeout(timerData.timeoutID);
      timerData.timeoutID = setTimeout(() =>
          setTime(typeof settings.timeModifier === "function" ? settings.timeModifier(time, 1_000) : time - 1_000),
        1_000);
    }
  }, [time, paused]);


  useEffect(() => {
    if (!paused && time <= 0) {
      setPaused(true);
      if (typeof onTimeout === "function")
        onTimeout();
    }
  }, [time]);

  return [time, {pause, resume, start, reset, timeToString: () => timeToString(time)}];
}

