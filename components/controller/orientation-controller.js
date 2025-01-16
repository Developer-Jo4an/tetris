import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setData } from './reducer/controller';

export default function OrientationController(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    initOrientation();

    return () => {
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, []);

  function initOrientation() {
    if (window.DeviceOrientationEvent) {
      if (DeviceOrientationEvent.requestPermission) {
        window.addEventListener.on('click', initRequestPermission);
      } else {
        window.addEventListener('deviceorientation', onOrientation);
      }
    }
  }

  function initRequestPermission() {
    DeviceOrientationEvent.requestPermission()
      .then((response) => response === 'granted' && window.addEventListener('deviceorientation', onOrientation))
      .catch(() => {
      });
    window.removeEventListener('click', initRequestPermission);
  }

  function onOrientation({ alpha, beta, gamma }) {
    dispatch(setData({
      alpha, beta, gamma, plugin: 'OrientationController', target: props.target,
    }));
  }

  return null;
}
