import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getRef, setData } from './reducer/controller';

export default function ScrollController(props) {
  const dispatch = useDispatch();
  const { target, window } = props;

  let targetElement, valueElement;

  useEffect(() => {
    targetElement = !window ? getRef(target).parentNode : global.window;
    valueElement = !window ? getRef(target).parentNode : document.body.parentNode;

    targetElement.addEventListener('scroll', onScroll);
    onScroll();
    return () => {
      targetElement.removeEventListener('scroll', onScroll);
    };
  }, []);


  function onScroll() {
    let xVal = window ? global.document.documentElement.clientWidth : targetElement.clientWidth;
    let yVal = window ? global.document.documentElement.clientHeight : targetElement.clientHeight;
    dispatch(setData({
      scrollX: 1/(xVal === valueElement.scrollWidth ? 1 : valueElement.scrollWidth - xVal)*valueElement.scrollLeft||0,
      scrollY: 1/(yVal === valueElement.scrollHeight ? 1 : valueElement.scrollHeight - yVal)*valueElement.scrollTop||0,
      plugin: 'ScrollController',
      target: props.target,
    }));
  }

  return null;
}
