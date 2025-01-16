export function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// ([1, 1, 1, 1, 1], [2, 2, 2]) => [2, 1, 1, 2, 1, 1, 2, 1]
function _evenDist(arr1, arr2) {
  const count = Math.round(arr2.length / (arr1.length + 1));

  if (!arr1.length)
    return [...arr2];

  return [...arr2.slice(0, count), arr1[0], ..._evenDist(arr1.slice(1), arr2.slice(count))];
}

function evenDist(arr1, arr2) {
  return arr1.length > arr2.length ? _evenDist(arr2, arr1) : _evenDist(arr1, arr2)
}

function findLongest(arraysList) {
  const max = Math.max(...arraysList.map(list => list.length));
  const index = arraysList.findIndex(x => x.length === max);
  return [arraysList [index], [...arraysList.slice(0, index), ...arraysList.slice(index + 1)]]
}


// [[1,1,1], [2,2,2], [3,3]] => [2, 1, 3, 1, 2, 3, 1, 2];
// Равномерно распределяет элементы
export function disperse(arraysList) {
  if (arraysList.length < 2)
    return [...(arraysList [0] || [])];

  const [longest, arraysLeft] = findLongest(arraysList);
  return evenDist(longest, disperse(arraysLeft));
}
