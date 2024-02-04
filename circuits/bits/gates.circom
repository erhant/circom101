pragma circom 2.1.0;

template AND() {
  signal input in[2];
  signal output out;

  out <== in[0]*in[1];
}

template OR() {
  signal input in[2];
  signal output out;

  out <== in[0] + in[1] - in[0]*in[1];
}

template XOR() {
  signal input in[2];
  signal output out;

  out <== in[0] + in[1] - 2*in[0]*in[1];
}

template NOT() {
  signal input in;
  signal output out;

  out <== 1 + in - 2*in;
}

template NAND() {
  signal input in[2];
  signal output out;

  out <== 1 - (in[0]*in[1]);
}

template NOR() {
  signal input in[2];
  signal output out;

  out <== 1 - (in[0] + in[1] - in[0]*in[1]);
}
