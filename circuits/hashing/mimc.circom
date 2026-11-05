pragma circom 2.1.0;

// We use Circomlib's MiMC implementations as they are:
// - `MiMC7` & `MultiMiMC7` from "mimc.circom"
// - `MiMCFeistel` & `MiMCSponge` from "mimcsponge.circom"
include "circomlib/circuits/mimc.circom";
include "circomlib/circuits/mimcsponge.circom";
