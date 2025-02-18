import Button from "../baseComponents/gui/button/Button";
import {useState} from "react";
import classNames from "classnames";

export const CustomButton = ({disabled, className, disposable, onClick, ...props} = {}) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const onClickCallback = e => {
    if (disposable)
      setIsDisabled(true);
    onClick?.(e);
  };

  return (
    <Button
      className={classNames("custom-button", className)}
      disabled={disabled || isDisabled}
      onClick={onClickCallback}
      {...props}
    />
  );
};