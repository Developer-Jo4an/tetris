import {useEffect, useState} from "react";

const breakpoints = [
  {
    name: "mobile",
    min: 0,
    max: 1023
  },
  {
    name: "desktop",
    min: 1024
  },
  {
    name: "desktopLand",
    min: 1024,
    maxRatio: 16 / 11
  }
];
const setters = [];

let windowWidth = global.innerWidth ?? 0, windowHeight = global.innerHeight ?? 0;
let isBaseSet;

if (global?.addEventListener)
  global?.addEventListener("resize", onResize);

function onResize() {
  updateData();
}

function updateData() {
  const prevWidth = windowWidth;
  const prevHeight = windowHeight;
  windowWidth = global.innerWidth;
  windowHeight = global.innerHeight;

  if (prevWidth !== windowWidth || prevHeight !== windowHeight)
    setters.forEach(({setSize}) => setSize([windowWidth, windowHeight]));
}

export default function useWindowSize() {
  const [[width, height], setSize] = useState([windowWidth, windowHeight]);

  useEffect(() => {
    const settersData = {setSize};
    setters.push(settersData);
    if (!isBaseSet) {
      updateData();
      isBaseSet = true;
    } else
      setSize([windowWidth, windowHeight]);

    return () => {
      const index = setters.indexOf(settersData);
      if (index !== -1)
        setters.splice(index, 1);
    }
  }, []);

  return [width, height, getBreakpoint(width, height)];
}

function getBreakpoint(width, height) {
  const filter = breakpoints.filter(({min, max, maxRatio}) => {
    const isSameSize = min <= width && width <= (max || Number.MAX_VALUE);
    const isSameRatio = maxRatio ? width / height < maxRatio : true;
    return isSameSize && isSameRatio;
  });

  return filter[filter.length - 1] || null;
}

export function setBaseSize(width, height) {
  isBaseSet = true;
  windowWidth = width;
  windowHeight = height;
}
