import React, {useEffect, startTransition} from "react";
import * as PropTypes from "prop-types";


export default function Icon({name, ...rest}) {
  const ImportedIconRef = React.useRef(null);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    let isClean = false;
    setLoading(true);
    (async () => {
      try {
        ImportedIconRef.current = (await import(`../../../../public/icons/${name}.svg`)).default;
      } catch (err) {
        console.log(err);
      } finally {
        if (!isClean)
          startTransition(() => setLoading(false));
      }
    })();

    return () => isClean = true;
  }, [name]);

  if (!loading && ImportedIconRef.current) {
    const {current: ImportedIcon} = ImportedIconRef;
    return <ImportedIcon {...rest} />;
  } else
    return null;
}


Icon.propTypes = {
  /**
   * Имя svg-файла
   */
  name: PropTypes.string
};

