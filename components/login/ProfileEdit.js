import React from "react";
import UserForm from "./UserForm";
import {email, required} from "../../constants/form";
import {useUser} from "../../redux/reducer/user";
import {useDispatch} from "react-redux";
import requests from "../../redux/reducer/requests";
import Input from "../baseComponents/gui/input/Input";
import Phone from "../baseComponents/gui/phone/Phone";

export default function ProfileEdit(args) {
  const {profile} = useUser();
  const dispatch = useDispatch();
  return (
    <>
      <UserForm action={requests.thunks.update} {...args}>
        <Input
          name="username"
          label="username : "
          autoComplete={"username"}
          defaultValue={profile?.username}
          register={required("username")}
        />
        <br/>
        <Input
          name="first_name"
          label="Имя : "
          autoComplete={"given-name"}
          defaultValue={profile?.first_name}
          register={required("Имя")}
        />
        <br/>
        <Input
          name="last_name"
          label="Фамилия : "
          autoComplete={"family-name"}
          defaultValue={profile?.last_name}
          register={required("Фамилия")}
        />
        <br/>
        <Input
          name="email"
          label="email : "
          autoComplete={"email"}
          defaultValue={profile?.email}
          register={email("email")}
        />
        <br/>
        <button type="submit">Отправить</button>
      </UserForm>
      <hr/>
      <UserForm>
        <h3>Сменить пароль</h3>
        <Input
          labelProps={{style: {display: "none"}}}
          name="username"
          label="username : "
          autoComplete={"username"}
          defaultValue={profile?.username}
          register={required("username")}
        />
        <Input
          name="password"
          type="password"
          autoComplete={"current-password"}
          label="Текущий пароль: "
          register={required("")}
        />
        <br/>
        <Input
          name="new_password"
          type="password"
          autoComplete={"new-password"}
          label="Новый пароль: "
          register={required("")}
        />
        <br/>
        <Input
          name="new_password"
          type="password"
          autoComplete={"new-password"}
          label="Ещё раз новый пароль: "
          register={required("")}
        />
        <br/>
        <button type="submit">Отправить</button>
      </UserForm>

      <hr/>

      <button onClick={() => dispatch(requests.thunks.logout())}>Выйти</button>

    </>
  );
}
