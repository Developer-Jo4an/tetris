export function getRandomFromRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function getRandomIntFromRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFromList(list) {
  return list[getRandomIntFromRange(0, list.length - 1)];
}
