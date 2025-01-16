import React, {useCallback} from "react";
import Form from "../baseComponents/gui/form/Form";
import {useDispatch} from "react-redux";
import {func, node, object} from "prop-types";
import requests, {useRequestData} from "../../redux/reducer/requests";

export default function UserForm({children, action, form, ...args}) {
  const requestName = action?.typePrefix ?? ""
  const dispatch = useDispatch();
  const {request} = useRequestData(requestName);
  const clearError = useCallback(field => dispatch(requests.actions.clearError({
    field,
    requestName
  })), [action]);
  const onSubmit = useCallback(data => dispatch(action(data)), [action]);

  return (
    <Form
      {...args}
      form={form}
      onSubmit={onSubmit}
      errors={{
        clearError,
        errors: request?.error?.fields
      }}
    >
      {children}
    </Form>
  );
}

UserForm.propTypes = {
  children: node,
  action: func,
  form: object,
};
