export function loadJSON(path) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE)
        if (xhr.status === 200)
          resolve(JSON.parse(xhr.responseText));
        else
          reject(xhr);
    };
    xhr.open("GET", path, true);
    xhr.send();
  });
}
