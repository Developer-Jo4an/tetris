export default async function ({ url, method }) {
  return fetch(url, { method }).then(async result => {
    if (result.ok)
      return await result.json();
    else
      throw Error("HTTP response status " + result.status);
  });
}
