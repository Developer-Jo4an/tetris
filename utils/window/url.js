/* eslint-disable */
export class URL {
  constructor(url) {
    url = /^(?:(https?):\/\/([^?#/:]+)(?::(\d+))?)?([^?#]*)?(\?[^#]*)?(#.*)?$/.exec(
      url
    );
    this.protocol = url[1];
    this.host = url[2];
    this.port = url[3];
    this.path = url[4];
    this.query = url[5];
    this.queryObj = URL.parseQueryString(this.query);
    this.hash = url[6];
  }

  static parseQueryString(q) {
    return q
      ? q
        .replace(/^\?/, "")
        .split("&")
        .reduce((result, itm) => {
          itm = itm.split("=");
          result[decodeURI(itm.shift())] = itm.length
            ? decodeURI(itm.join("="))
            : true;
          return result;
        }, {})
      : {};
  }

  static fromObject(obj, sep = "&", prefix = "?") {
    const str = Object.keys(obj)
      .map(
        key =>
          key +
          (obj[key] === true
            ? ""
            : "=" +
            encodeURI(obj[key]).replace(
              /[!"()*]/g,
              c => `%${c.charCodeAt(0).toString(16)}`
            ))
      )
      .join(sep);

    return str ? prefix + str : "";
  }

  extend(url) {
    if (typeof url === "string") {
      url = new URL(url);
    }

    ["protocol", "host", "port", "path", "query", "hash"]
      .forEach(key => {
        if (key !== "query") {
          this[key] = url[key] || this[key];
        } else if (url.queryObj){
          Object.keys(url.queryObj).forEach(key => {
            if (url.queryObj[key] !== false) {
              this.queryObj[key] = url.queryObj[key];
            } else {
              delete this.queryObj[key];
            }
          });
        }
      });

    return this;
  }

  join() {
    const protocol = this.protocol ? `${this.protocol  }://` : "";
    const host = this.host || "";
    const port = this.port
      ? (this.protocol === "http" && this.port === 80 ||
      this.protocol === "https" && this.port === 443
        ? ""
        : `:${this.port}`)
      : "";
    const path = this.path || "";

    const query = URL.fromObject(this.queryObj);

    return `${protocol}${host}${port}${path}${query}${this.hash || ""}`;
  }

  toString() {
    return this.join();
  }
}
