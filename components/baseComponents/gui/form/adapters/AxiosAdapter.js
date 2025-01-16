import axios from "axios";

export default function ({ url, method }) {
  return axios({ url, method });
}
