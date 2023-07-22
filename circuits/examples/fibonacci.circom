pragma circom 2.1.0;

// Fibonacci with custom starting numbers
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

// Fibonacci with custom starting numbers, recursive & inefficient
template FibonacciRecursive(n) {
  signal input in[2];
  signal output out;
  
  if (n <= 1) {
    out <== in[n];
  } else {
    var l = FibonacciRecursive(n-1)(in);
    var r = FibonacciRecursive(n-2)(in);
    out <== l + r;
  }
}