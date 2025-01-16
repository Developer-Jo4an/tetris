import axios from "axios";
import ApiError from "./ApiError";
const prefix = "/api/v1";

function isAbsolute(str) {
	return /^(\w+:)?\/\//.test(str);
}

function hasPrefix(method, prefix) {
	return prefix && method.indexOf(prefix) === 0;
}

function getURL(method) {
	if (isAbsolute(method) || hasPrefix(method, prefix)) {
		return method;
	}

	return `${prefix}${method}`;
}

function initMethod(method) {
	return (apiMethod, data = {}) => send({method, apiMethod, data});
}

let globalHeaders = {};
export function addHeaders(_headers) {
  Object.keys(_headers)
    .forEach(key => {
      if (key === false) {
        delete globalHeaders[key];
      } else {
        globalHeaders[key] = _headers[key];
      }
    })
}

export const get = initMethod("get");
export const post = initMethod("post");

export function send({apiMethod, ...params}) {
	return axios({
		...params,
    headers: {
      ...globalHeaders,
      ...params?.headers,
    },
		url: getURL(apiMethod)
	})
		.then(onSuccess, onFail);
}

/**
 *
 * @param {{data, status, statusText, headers, config}} response
 * @return {*}
 */
function onSuccess(response) {
	const {data} = response;
	if (ApiError.isError(data)) {
		throw ApiError.fromApiResponse(data);
	}
	return data.data;
}

function onFail(error) {
	if (error.response && typeof error.response.data === "object") {
		throw ApiError.fromApiResponse(error.response.data);
	} else if(error.request) {
		throw ApiError.fromHttpError(error.request);
	} else {
		throw new ApiError({});
	}
}
