import RequestsBuilder from "../../utils/redux/RequestsBuilder";
import {login, logout, profile, signup, update} from "../../api/user";


const builder = new RequestsBuilder({
  name: "requests",
  initialState: {},
  reducers: {
    clearError(state, {payload: {field, requestName} = {}}) {
      if (!field) return;
      requestName = builder.getRequestByName(requestName);

      const requestData = state.requests[`requests/${requestName}`];
      if (!requestData?.error?.fields?.[field]) return;

      delete requestData.error.fields[field];

      if (!Object.keys(requestData.error.fields).length)
        requestData.error = null;
    }
  }
})
  .addRequest({
    requestName: "user/login",
    extraName: "login",
    checkLocal: true,
    func: login
  })
  .addRequest({
    requestName: "user/signup",
    extraName: "signup",
    checkLocal: true,
    func: signup
  })
  .addRequest({
    requestName: "user/profile",
    extraName: "profile",
    checkLocal: true,
    func: profile
  })
  .addRequest({
    requestName: "user/update",
    extraName: "update",
    checkLocal: true,
    func: update
  })
  .addRequest({
    requestName: "user/logout",
    extraName: "logout",
    checkLocal: true,
    func: logout
  })


builder.create();

const requests = builder.export();

export default requests;

/**
 * Хук для получения статуса запроса.
 * @param requestName [String] `request/${requestName}`
 * @returns requestData [{local:{currentRequestId, error, state}, global:{currentRequestId, error, state}}]
 */
export const {useRequestData} = requests.selectors;
