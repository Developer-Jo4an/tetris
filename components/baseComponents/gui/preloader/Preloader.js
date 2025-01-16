import React, {useEffect} from 'react';
import PreloaderItems from "./PreloaderItems";


export default function Preloader() {
  useEffect(() => {
    document.body.classList.add("_preloader");
    return () => {
      document.body.classList.remove("_preloader");
    }
  }, []);

  return (
    <div className={"preloader"}>
      <div className={"preloader__block"}>
        {<PreloaderItems total={4}/>}
      </div>
    </div>
  )
}
