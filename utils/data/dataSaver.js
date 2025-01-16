const storage = {};
let idCounter = 0;

export function saveData(data) {
  const id = idCounter++;
  storage[id] = data;
  return id;
}

export function getData(id, isClear) {
  const result = storage[id];
  if (isClear)
    delete storage[id];
  return result;
}
