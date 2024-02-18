<p align="center">
  <h1 align="center">
    Circom101
  </h1>
  <p align="center">
    <i>Circom circuit implementations with in-depth explanations.</i>
  </p>
</p>

<p align="center">
    <a href="https://opensource.org/licenses/MIT" target="_blank">
        <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-6495ED.svg">
    </a>
    <a href="./.github/workflows/tests.yml" target="_blank">
        <img alt="Workflow: Tests" src="https://github.com/erhant/circom101/actions/workflows/tests.yml/badge.svg?branch=main">
    </a>
    <a href="./.github/workflows/deploy-book.yml" target="_blank">
        <img alt="Workflow: Book Deployment" src="https://github.com/erhant/circom101/actions/workflows/deploy-book.yml/badge.svg?branch=main">
    </a>
</p>

## Setup

Install packages with:

```sh
yarn install
```

## Book

We use `mdbook` to create the book, see the [book](./book/) folder. You can build the book with the following:

```sh
yarn book # automatically serve the book
yarn book:build # build without serving
```

## Tests

Run circuit tests with:

```sh
yarn test

# with pattern matching
yarn test pattern-name

# with explicit paths
yarn test ./path/to/some.test.ts
```

The tests make use of [Circomkit](https://github.com/erhant/circomkit).

## Style

Check the formatting with the following command:

```sh
yarn format
```

This command checks the test code with [Prettier](https://www.npmjs.com/package/prettier), and lints the book with [Markdownlint](https://www.npmjs.com/package/markdownlint).
