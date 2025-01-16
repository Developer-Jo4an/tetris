import React, {
  cloneElement,
  createElement,
  Fragment,
  isValidElement
} from "react";
import {Controller} from "react-hook-form";
import InputMask from "react-input-mask";
import * as PropTypes from "prop-types";


export default function Input({
                                as = "input",
                                children,
                                register,
                                control,
                                error,
                                name,
                                errorData,
                                ...rest
                              }) {
  const props = {name, ref: register, ...rest};

  let element;

  if (props.mask)
    element = InputWithMask(name, control, {...props, errorData});
  else if (isValidElement(as))
    element = cloneElement(as, {...props, errorData});
  else
    element = createElement(as, props);

  return (
    <Fragment>
      {element}
      {error ? <span className="input__error">{error}</span> : null}
      {children}
    </Fragment>
  );
}

function InputWithMask(name, control, props) {
  return (
    <Controller
      name={name}
      control={control}

      rules={props.rules}
      defaultValue={props.defaultValue || props.mask.replace(/9/gi, "_")}

      render={
        ({onChange, value}) => (
          <InputMask mask={props.mask}
                     alwaysShowMask={props.alwaysShowMask}
                     value={value}
                     onChange={(e) => {
                       onChange(e);
                       if (props.onChange)
                         props.onChange(e);
                     }}>
            {(inputProps) => (
              <input
                {...inputProps}
                className={props.className}
              />
            )}
          </InputMask>
        )}
    />
  )
}

Input.propTypes = {
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
    PropTypes.element
  ]),
  children: PropTypes.node,
  register: PropTypes.func,
  error: PropTypes.object,
  name: PropTypes.string.isRequired
};
