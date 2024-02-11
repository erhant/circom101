pragma circom 2.1.0;

// Fibonacci with custom starting numbers
//
// Inputs:
// - in: the starting two numbers, usually 1 and 1
//
// Outputs:
// - out: the `n`th Fibonacci number, w.r.t given starting numbers.
template Fibonacci(n) {
  assert(n >= 2);
  signal input in[2];
  signal output out;

  signal fib[n+1];
  fib[0] <== in[0];
  fib[1] <== in[1];
  for (var i = 2; i <= n; i++) {
    fib[i] <== fib[i-2] + fib[i-1];
  }

  out <== fib[n];
}
