import React, { useCallback, useEffect, useRef, useState } from "react";
import Form from "./Form";
import {func, node, string} from "prop-types";

export default function AjaxForm({ children, adapter, url, method, onErrorMessage, onResponse, ...rest }) {
  const ref = useRef();
  const [errorMessage, setErrorMessage] = useState(null);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    if (typeof onErrorMessage === "function")
      onErrorMessage(errorMessage);
  }, [onErrorMessage, errorMessage]);
  useEffect(() => {
    if (typeof onResponse === "function")
      onResponse(response);
  }, [onResponse, response]);

  const errorMessageCallback = useCallback(() => setErrorMessage(null), []);

  function validateResponse(response) {
    if (response.success || response.success === undefined)
      setResponse(response);
    else if (response.data) {
      if (typeof response.data.message === "string")
        setErrorMessage(response.data.message);
      else
        Object.entries(response.data.message).forEach(([key, message]) => ref.current.setError(key, {
          type: "manual", //todo получать тип от сервера
          message
        }));
    }
  }

  async function onSubmit(data) {
    try {
      validateResponse(await adapter({ url, method, data }));
    } catch (e) {
      const { response } = e;
      if (response && response.data)
        validateResponse(response.data);
      console.error(e);
      setErrorMessage(e.toString());
    }
  }

  return (<Form onSubmit={ onSubmit } onWatch={ errorMessageCallback } ref={ ref } { ...rest }>
    { children }
  </Form>)
}

AjaxForm.propTypes = {
  children: node,
  adapter: func,
  url: string,
  method: string,
  onErrorMessage: func,
  onResponse: func,
};
