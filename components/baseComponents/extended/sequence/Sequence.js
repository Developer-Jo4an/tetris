import React, {useEffect, useState, useMemo} from "react";
import classNames from "classnames";
import {onBrowserVisibleChange} from "../../../../utils/window/visibility";

const Sequence = React.forwardRef(
  /**
   *
   * @param src ссылка на изображение
   * @param keyframesX количество кадров по горизонтали
   * @param keyframesY количество кадров по вертикали
   * @param totalFrames общее количесво кадров
   * @param paused статус остановки проигрывания
   * @param loop зацикленность воспроизведения
   * @param fps частота кадров в секунду проигрывания
   * @param ref реф на элемент
   * @returns {JSX.Element}
   * @constructor
   */
  function Sequence({
                      src, keyframesX, keyframesY, totalFrames,
                      paused = false, loop = true, fps = 60,
                      ...etc
                    }, ref) {
    const status = useMemo(() => ({paused}), [])
    const [offset, setOffset] = useState({x: 0, y: 0});

    status.paused = paused;

    useEffect(() => {
      const delta = 1000 / fps;
      let isUnmounted = false;
      let currentFrame = 0;
      let currentTime = Date.now();
      let isPageHidden = document.hidden;

      const unsubscribe = onBrowserVisibleChange(hidden => {
        if (isPageHidden !== hidden) {
          currentTime = Date.now();
        }
        isPageHidden = hidden;
      });

      function update() {
        if (isUnmounted) return;

        const now = Date.now();
        const cDelta = now - currentTime;

        if (cDelta > delta) currentTime += delta;
        else return requestAnimationFrame(update);

        if (status.paused) return requestAnimationFrame(update);

        const x = -currentFrame % keyframesX * 100;
        const y = -Math.floor(currentFrame / keyframesX) * 100;

        setOffset({x, y});

        if (loop || currentFrame !== totalFrames - 1)
          currentFrame = (currentFrame + 1) % totalFrames;

        requestAnimationFrame(update);
      }

      requestAnimationFrame(update);

      return () => {
        isUnmounted = true;
        unsubscribe();
      }
    }, [])

    return (
      <div className={classNames("sequence", etc.className)} ref={ref}
           style={{
             backgroundImage: `url(${src})`,
             backgroundSize: `${keyframesX * 100}% ${keyframesY * 100}%`,
             backgroundPosition: `${offset.x}% ${offset.y}%`,
             ...etc.style
           }}
           {...etc}
      />
    );
  });

export default Sequence;
Sequence.propTypes = {};

