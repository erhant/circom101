import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  // ts-jest defaults
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|js)$": "ts-jest",
  },
  verbose: true,
  testTimeout: 40_000,
  testPathIgnorePatterns: ["/node_modules/", "/examples/", "/book/", "/circuits/"],
};

export default config;
