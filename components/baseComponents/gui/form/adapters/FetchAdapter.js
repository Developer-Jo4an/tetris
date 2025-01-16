export default async function ({ url, method }) {
  return fetch(url, { method });
}
