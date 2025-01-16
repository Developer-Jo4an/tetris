/* eslint-disable */
export default class ApiError {
	/**
	 * API вернул ошибку
	 * @type {string}
	 */
	static ERROR_RESPONSE = "ERROR_RESPONSE";

	/**
	 * Необработанная ошибка сервера - вернулся не json файл
	 * @type {string}
	 */
	static SERVER_ERROR = "SERVER_ERROR";

	/**
	 * @param {*} [params] - params
	 * @param {number|string?} [params.code?] - код ошибки
	 * @param {{}|{name:string, message:string}[]?} [params.fields] - список ошибок в конкретном поле
	 * @param {string|{title:string, body:string}?} [params.message] - общее сообщение
	 * @param {string?} [params.response] - необработанный ответ от сервера
	 */
	constructor({ code, fields, message, response }) {
		this.code = code;
		this.fields = initFields(fields);
		this.message = message;
		this.response = response;
	}

	toSerializable() {
		return {
			code: this.code,
			fields: this.fields,
			message: this.message,
			response: this.response,
		}
	}

	static fromApiResponse(info) {
		const data = info && info.data;
		const { errors, status, message, name } = data || {};

		return new ApiError({
			code: status,
			response: info,
			fields: errors || message,
			message: (message && message["-"]) || name
		});
	}

	static fromHttpError(xhr) {
		return new ApiError({
			code: xhr.status,
			message: xhr.statusText,
			response: xhr.responseText
		});
	}

  static isError(data) {
    return data.success !== true;
  }
}

function initFields(fields) {
  if (fields) {
    Object.keys(fields)
      .forEach(key => {
        fields[key] = {
          message: fields[key] // .join("<br/>")
        };
      })
  }
  return fields;
}
