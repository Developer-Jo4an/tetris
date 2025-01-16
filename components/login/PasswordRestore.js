import React, {useRef} from "react";
import {required} from "../../constants/form";
import Form from "../baseComponents/gui/form/Form";
import {post} from "../../utils/api/api";
import Input from "../baseComponents/gui/input/Input";

export default function PasswordRestore() {
  const onSubmit = useRef((data) => {
    post("/user/password-restore", data);
  });
  return (
    <Form onSubmit={onSubmit.current}>
      <Input
        name="email"
        label="email: "
        defaultValue="asd@asd.as"
        register={required("e-mail")}
      />
      <br/>
      <button type="submit">Отправить</button>
    </Form>
  );
}
