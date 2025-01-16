import React from "react";
import requests from "../../redux/reducer/requests";
import UserForm from "./UserForm";
import {required} from "../../constants/form";
import Input from "../baseComponents/gui/input/Input";

export default function SignIn(args) {
  return (
    <UserForm action={requests.thunks.login} {...args}>
      <Input
        name="login"
        label="email: "
        autoComplete={"email"}
        defaultValue="asd@asd.as"
        register={required("e-mail")}
      />
      <br/>

      <br/>
      <Input
        name="password"
        type="password"
        autoComplete={"current-password"}
        label="Пароль: "
        defaultValue="111111"
        register={required("пароль")}
      />
      <br/>
      <button type="submit">Отправить</button>
    </UserForm>
  );
}
