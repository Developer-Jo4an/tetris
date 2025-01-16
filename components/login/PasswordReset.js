import React, {useRef} from "react";
import {required} from "../../constants/form";
import Form from "../baseComponents/gui/form/Form";
import {post} from "../../utils/api/api";
import {useForm} from "react-hook-form";
import Input from "../baseComponents/gui/input/Input";

function getToken() {
  return new URLSearchParams(global.location?.search).get("token")
}

export default function PasswordReset() {
  const onSubmit = useRef((data) => {
    post("/user/password-reset", {
      ...data,
      reset_password_token: getToken()
    });
  });
  const form = useForm();
  return (
    <Form onSubmit={onSubmit.current} form={form}>
      <div>Token: `{getToken()}`</div>
      <Input
        labelProps={{style: {display: "none"}}}
        name="username"
        label="username : "
        autoComplete={"username"}
        register={required("username")}
      />
      <Input
        name="password"
        type="password"
        autoComplete={"new-password"}
        label="Пароль: "
        defaultValue="1"
        register={required("Пароль")}
      />
      <br/>
      <Input
        name="password_repeat"
        type="password"
        autoComplete={"new-password"}
        label="Ещё раз пароль: "
        defaultValue="1"
        register={{
          ...required("Пароль"),
          validate: value => value === form.getValues("password") || "Введенные пароли не совпадают"
        }}
      />
      <br/>
      <button type="submit">Отправить</button>
    </Form>
  );
}
