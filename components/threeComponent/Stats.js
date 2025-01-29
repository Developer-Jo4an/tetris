import {useEffect, useState} from "react";

export const Stats = ({eventBus}) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!eventBus) return;

    const callbacks = {
      "timeout:update": ({remainder}) => {
        console.log(remainder);
      },
      "targetPoints:update": ({targetPoints}) => {
        console.log(targetPoints);
      }
    };

    const listenerLogic = method => {
      for (const key in callbacks)
        eventBus[`${method}EventListener`](key, callbacks[key]);
    };

    listenerLogic("add");
    return () => listenerLogic("remove");
  }, [eventBus]);

  return (
    <></>
  );
};