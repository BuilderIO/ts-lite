import { expect, test } from '@jest/globals';
import { toSwift } from './swift';

test('Can generate some swift', () => {
  const tsCode = `
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
  `;

  expect(toSwift(tsCode)).toMatchSnapshot();
});
