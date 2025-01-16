import React, {useEffect, useState} from "react";

export default function FocusController({onBlur, onFocus, value}){
  const [preBlurValue, setPreBlurValue] = useState(value);

  const handleBlur = () =>{
    setPreBlurValue(value);
    onBlur && onBlur();
  };

  const handleFocus = () =>{
    onFocus && onFocus(preBlurValue);
  };

  useEffect(() => {
    onBlur && window.addEventListener('blur', handleBlur);
    onFocus && window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  });

  return null;
}