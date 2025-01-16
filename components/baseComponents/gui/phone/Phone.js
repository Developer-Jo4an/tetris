import React from "react";
import LabelInput from "../form/LabelInput";
import classNames from "classnames";
import {checkPhone} from "../../../../constants/form";

const Phone = React.forwardRef(
  function Phone({
                   label,
                   className,
                   autoComplete = "tel",
                   alwaysShowMask = true,
                   rules = {...checkPhone()},
                   mask = "+7 (999) 999-99-99",
                   ...rest
                 }, ref) {
    return (
      <LabelInput
        mask={mask}
        rules={rules}
        autoComplete={autoComplete}
        alwaysShowMask={true}
        labelProps={
          {
            className: classNames("input", {
              className: className,
              "input__error": rest?.error?.props?.errors[rest.name] || {}.length
            })
          }
        }
        label={label ? <div className={"input__name"}>{label}</div> : null}
        className="input__block"
        maxLength={`${rest.max ? rest.max : null}`}
        {...rest}
      />
    );
  });

export default Phone;
Phone.propTypes = {};

