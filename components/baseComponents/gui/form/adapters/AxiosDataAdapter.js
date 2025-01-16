import axios from "axios";

export default async function ({ url, method }) {
  return (await axios({ url, method })).data;
}
