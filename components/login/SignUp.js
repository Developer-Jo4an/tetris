import React from "react";
import Select from "../baseComponents/gui/form/Select";
import Checkbox from "../baseComponents/gui/form/Checkbox";
import UserForm from "./UserForm";
import {useForm} from "react-hook-form";
import {required, email} from "../../constants/form";
import requests from "../../redux/reducer/requests";
import Input from "../baseComponents/gui/input/Input";
import Phone from "../baseComponents/gui/phone/Phone";

export default function SignUp(args) {
  const form = useForm();
  return (
    <UserForm form={form} action={requests.thunks.signup} {...args}>
      <Input
        name="username"
        label="Имя: "
        autoComplete={"given-name"}
        defaultValue="Имя"
        register={required("Имя")}
      />
      <br/>
      <Phone name={"phone"}/>
      <br/>
      <Input
        name="last_name"
        label="Фамилия: "
        autoComplete={"family-name"}
        defaultValue="Фамилия"
        register={required("Фамилия")}
      />
      <br/>
      <Input
        name="email"
        label="E-mail: "
        autoComplete={"email"}
        defaultValue="asd@asd.as"
        register={email("E-mail")}
      />
      <br/>
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
      <Select
        name="gender"
        label="Пол: "
        options={[
          {label: "Жен", value: 1},
          {label: "Муж", value: 2},
          {label: "другое", value: 3}
        ]}
      />
      <br/>
      <Checkbox
        labelAs={<>Согласен с <a>политикой безопасности</a>:</>}
        name="agreement"
        defaultChecked
        value={1}
        register={required({"message": "Необходимо согласиться с политикой безопасности"})}
      />
      <br/>
      <button type="submit">Отправить</button>
    </UserForm>
  );
}
