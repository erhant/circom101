// simple fibonacci with 2 variables
export function fibonacci(init: [number, number], n: number): number {
  if (n < 0) {
    throw new Error("N must be positive");
  }

  let [a, b] = init;
  for (let i = 2; i <= n; i++) {
    b = a + b;
    a = b - a;
  }
  return n === 0 ? a : b;
}
