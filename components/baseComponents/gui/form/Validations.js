import { string, object, number } from "yup";
import { yupResolver } from "@hookform/resolvers";

export const name = string().required();
export const age = number()
  .transform((value) => (isNaN(value) ? undefined : value))
  .integer()
  .min(18)
  .max(100)
  .required();

export const createResolver = (schema) => yupResolver(object().shape(schema));
