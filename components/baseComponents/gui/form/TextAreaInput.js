import React from "react";
import LabelInput from "./LabelInput";

export default function TextAreaInput(props) {
  return <LabelInput type="checkbox" {...props} as="textarea"/>;
}
