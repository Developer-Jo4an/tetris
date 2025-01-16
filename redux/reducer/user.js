import Builder from "../../utils/redux/builder";

/**
 * slice name
 * @type {string}
 */

const builder = new Builder({
  name: "user",
  initialState: {
    profile: null
  }
})
  .addMatcher(() => true, (state, {payload = {}}) => {
    if (payload.hasOwnProperty("profile"))
      state.profile = payload.profile;
  })

builder.create();

const user = builder.export();

export default user;

export const {useUser} = user.selectors;
