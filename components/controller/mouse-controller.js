import {useEffect, useState, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {setData, getRef} from './reducer/controller';

export default function MouseController(props) {
  const {
    noMouse, noTouch, target, window, globalCoords, catching
  } = props;

  const defaults = {
    catchingTickerStopMargin: 0.000001,
    catchInterval: 20
  };

  const settings = {...defaults, ...props};

  const dispatch = useDispatch();

  let targetElement;

  const [currentPosition, _setCurrentPosition] = useState();
  const currentPositionRef = useRef(currentPosition);
  const setCurrentPosition = data => {
    currentPositionRef.current = data;
    _setCurrentPosition(data);
  };

  const [tickerState, _setTickerState] = useState();
  const tickerStateRef = useRef(tickerState);
  const setTickerState = data => {
    tickerStateRef.current = data;
    _setTickerState(data);
  };

  const onMouseMove = (event, recievedPosition) => {
    const position = recievedPosition ? undefined : getOffsetPosition(event);
    let pos = recievedPosition ? recievedPosition : {
      x: globalCoords ? 1 / global.window.innerWidth * position.x :
        1 / targetElement[window ? "innerWidth" : "offsetWidth"] * position.x,
      y: globalCoords ? 1 / global.window.innerWidth * position.y :
        1 / targetElement[window ? "innerHeight" : "offsetHeight"] * position.y
    };
    const currentPos = currentPositionRef.current;
    const actualPos = pos ? {...pos} : {};
    clearInterval(tickerStateRef.current);
    setTickerState(false);

    if (catching && currentPos !== undefined) {
      const rangeX = pos.x - currentPos.x;
      const rangeY = pos.y - currentPos.y;
      const totalRange = Math.sqrt(rangeX ** 2 + rangeY ** 2);
      pos = {
        x: pos.x - rangeX * catching,
        y: pos.y - rangeY * catching
      };
      setCurrentPosition({...pos, ...{actualX: actualPos.x, actualY: actualPos.y, eventData: event}});
      if (totalRange > settings.catchingTickerStopMargin && !tickerStateRef.current) setTickerState(
        getCatchingInterval(
          settings.catchingTickerStopMargin,
          settings.catchInterval,
          catching,
          currentPositionRef.current,
          setData,
          dispatch,
          props.target,
          setCurrentPosition
        )
      );
    } else if (catching)
      setCurrentPosition({...pos, ...{actualX: actualPos.x, actualY: actualPos.y, eventData: event}});

    dispatch(setData({
      mouseX: pos.x < 0 ? 0 : pos.x > 1 ? 1 : pos.x,
      mouseY: pos.y < 0 ? 0 : pos.y > 1 ? 1 : pos.y,
      plugin: 'MouseController', target: props.target,
    }));
  };

  useEffect(() => {
    targetElement = !window ? getRef(target) : global.window;

    if (!noMouse) targetElement.addEventListener('mousemove', onMouseMove, true);
    if (!noTouch) {
      targetElement.addEventListener('touchmove', onMouseMove, true);
      targetElement.addEventListener('touchstart', onMouseMove, true);
    }

    dispatch(setData({
      noTouch,
      plugin: 'MouseController', target: props.target,
    }));

    targetElement.addEventListener('touchstart', () => {
      dispatch(setData({
        touchDetected: true,
        plugin: 'MouseController', target: props.target,
      }));
    }, true);


    return () => {
      clearInterval(tickerStateRef.current);
      targetElement.removeEventListener('mousemove', onMouseMove, true);
      targetElement.removeEventListener('touchmove', onMouseMove, true);
      targetElement.removeEventListener('touchstart', onMouseMove, true);
    };
  }, []);

  return null;
}

function getOffsetPosition({touches, target, currentTarget, offsetX, offsetY, pageX, pageY}, globalCoords) {
  const targetRect = boundingRect(target);
  const currentTargetRect = boundingRect(currentTarget);

  if (globalCoords) {
    return {
      x: touches ? touches[0].pageX : pageX,
      y: touches ? touches[0].pageY : pageY
    }
  }

  if (!touches) {
    return {
      x: offsetX + targetRect.left - currentTargetRect.left,
      y: offsetY + targetRect.top - currentTargetRect.top
    }
  } else {
    return {
      x: touches[0].pageX - target.offsetLeft,
      y: touches[0].pageY - target.offsetTop
    }
  }
}

function boundingRect(element) {
  return element === global.window ? {top: 0, left: 0} : element.getBoundingClientRect();
}

function getCatchingInterval(limit, time, catching, currentPos, setData, dispatch, target, setCurrentPosition) {
  const interval = setInterval(() => {
    const rangeX = currentPos.actualX - currentPos.x;
    const rangeY = currentPos.actualY - currentPos.y;
    const totalRange = Math.sqrt(rangeX ** 2 + rangeY ** 2);
    if (totalRange > limit) {
      currentPos.x = currentPos.actualX - rangeX * catching;
      currentPos.y = currentPos.actualY - rangeY * catching;
      setCurrentPosition({...currentPos, ...{actualX: currentPos.x, actualY: currentPos.y}});
      dispatch(setData({
        mouseX: currentPos.x < 0 ? 0 : currentPos.x > 1 ? 1 : currentPos.x,
        mouseY: currentPos.y < 0 ? 0 : currentPos.y > 1 ? 1 : currentPos.y,
        plugin: 'MouseController', target,
      }));
    } else {
      clearInterval(interval)
    }
  }, time);

  return interval;
}
