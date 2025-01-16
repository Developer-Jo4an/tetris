import React, {Fragment, forwardRef, useImperativeHandle, useEffect} from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import * as PropTypes from "prop-types";
import {useForm} from "react-hook-form";
import {ErrorMessage} from "@hookform/error-message";
import {password} from "../../../../constants/form";

const renderMultipleErrors = ({message, messages}) => {
  messages = messages || [message]; //todo: сделать через if?
  return (
    messages &&
    Object.entries(messages).map(([type, message]) => (
      <Fragment key={type}>
        {message}
      </Fragment>
    ))
  );
};

const Form = forwardRef(
  (
    {
      as = "form",
      useFormProps,
      errors: externalErrors,
      isLocalErrors = true,
      isGlobalErrors = false,
      children,
      onWatch,
      onValidation,
      onError,
      onSubmit,
      form,
      slots,
      ...rest
    },
    ref
  ) => {
    const formController = useForm(useFormProps);
    const {
      errors, setError,
      register, watch, control, handleSubmit, trigger, reset, formState, getValues
    } = form || formController;

    const result = watch();

    useDeepCompareEffect(() => {
      onWatch && onWatch(result);
    }, [onWatch, result]);

    useEffect(() => {
      if (onValidation) {
        onValidation(formState.isValid);
      }
    }, [onValidation, formState]);

    useDeepCompareEffect(() => {
      if (onError) {
        const plainErrors = JSON.stringify(errors, (key, value) => {
          if (value instanceof HTMLElement) return undefined;
          return value;
        });
        onError(JSON.parse(plainErrors), errors);
      }
    }, [onError, errors]);
    useImperativeHandle(
      ref,
      () => ({
        setError,
        reset,
        trigger
      }),
      [setError, reset, trigger]
    );
    let newChildren = React.Children.map(children, initInput);

    function initInput(child) {
      if (!child?.props?.name) {
        return child;
      }

      let {name, register: reg} = child.props;
      if (reg && name === "password_repeat") {
        reg = {
          ...reg,
          ...password(() => getValues("password"))
        }
      }
      const errorData = externalErrors?.errors?.[child.props.name]
        ? externalErrors.errors
        : errors;

      return React.createElement(child.type, {
        ...child.props,
        onChange: (e) => {
          externalErrors?.clearError?.(child.props.name);
          if (typeof child.props.onChange === "function")
            child.props.onChange.call(this, e);
        },
        control,
        register: reg ? register(reg) : register,
        key: child.props.name,
        errorData,
        error: isLocalErrors
          ? child.props.error || (
          <ErrorMessage
            name={child.props.name}
            errors={
              errorData
            }
            render={renderMultipleErrors}
          />
        )
          : null
      })
    }

    if (isGlobalErrors)
      newChildren = addGlobalErrors(newChildren, errors, externalErrors.errors);

    const props = {
      ...rest,
      slots: getSlots(),
      children: newChildren,
      onSubmit: onSubmit ? handleSubmit(onSubmit) : handleSubmit(() => {
      })
    };
    return React.isValidElement(as)
      ? React.cloneElement(as, props)
      : React.createElement(as, props);

    function getSlots() {
      if (!slots) return null;
      return Object.keys(slots).reduce((res, key) => {
        res[key] = React.Children.map(slots[key], initInput);
        return res;
      }, {})
    }
  }
);

function addGlobalErrors(children, errors, externalErrors) {
  const errorsComponents = children
    .filter((child) => child?.props?.name)
    .map(
      ({props: {error, name}}) =>
        error || (
          <ErrorMessage
            name={name}
            errors={{...errors, ...externalErrors}}
            key={name}
            render={renderMultipleErrors}
          />
        )
    );
  return [...children, ...errorsComponents];
}

Form.propTypes = {
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
    PropTypes.element
  ]),
  isLocalErrors: PropTypes.bool,
  isGlobalErrors: PropTypes.bool,
  /**
   *  параметры хука useForm для react-hook-form
   */
  useFormProps: PropTypes.object,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  onWatch: PropTypes.func,

  errors: PropTypes.object,
  children: PropTypes.array,
  onValidation: PropTypes.func,
  form: PropTypes.object,
};
Form.displayName = "Form";
export default Form;
