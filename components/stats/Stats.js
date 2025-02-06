import {useEffect, useState} from "react";

export const Stats = ({eventBus}) => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (!eventBus) return;

    const callbacks = {
      "timeout:update": ({remainder}) => {
        setStats(prev => ({...prev, remainingTime: remainder}));
      },
      "targetPoints:update": ({targetPoints}) => {
        setStats(prev => ({...prev, targetPoints}));
      },
      "currentPoints:update": ({updatedCount}) => {
        setStats(prev => ({...prev, currentCount: updatedCount}));
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
    <div className={"stats"}>
      <div className={"stats__list"}>
        {Object.entries(stats).map(([key, value]) => <div key={key} className={"stats__item"}>{key}:{value}</div>)}
      </div>
    </div>
  );
};