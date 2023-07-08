pragma circom 2.1.0;

template Num2Bits(n) {
  signal input in;
  signal output {binary} out[n];

  var sum = 0;
  var bit_value = 1;

  for (var i = 0; i<n; i++) {
    out[i] <-- (in >> i) & 1;
    out[i] * (out[i] - 1) === 0;
    sum += out[i] * bit_value;
    bit_value <<= 1;
  }

  sum === in;
}


template Bits2Num(n) {
signal input in[n];
signal output {binary} out;
var lc1=0;

var e2 = 1;
for (var i = 0; i<n; i++) {
  lc1 += in[i] * e2;
  e2 = e2 + e2;
}

lc1 ==> out;
}