export function getRandomArrayElements (arr, count) {
  const shuffled = arr.slice(0)
  let l = arr.length
  const min = l - count
  let temp
  let index

  while (l-- > min) {
    index = Math.floor((l + 1) * Math.random())
    temp = shuffled[index]
    shuffled[index] = shuffled[l]
    shuffled[l] = temp
  }
  return shuffled.slice(min)
}
