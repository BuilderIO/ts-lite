export const defaultCode = `
function fib(index: Int): Int {
  let n = index
  let a = 0
  let b = 1
  if (n > 0) {
    while (--n) {
      let t = a + b
      a = b
      b = t
    }
    return b
  }
  return a
}
`.trim();

export const templates: { [key: string]: string } = {
  fibonacci: defaultCode,
};
