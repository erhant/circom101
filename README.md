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
bun install
```

## Book

We use `mdbook` to create the book, see the [book](./book/) folder. You can build the book with the following:

```sh
bun book # automatically serve the book
bun book:build # build without serving
```

The book is based on the [mdBook template](https://github.com/erhant/mdbook-template) and is published at <https://circom.erhant.me>.

## Tests

Run circuit tests with:

```sh
bun test

# with pattern matching
bun test pattern-name

# with explicit paths
bun test ./path/to/some.test.ts
```

The tests make use of [Circomkit](https://github.com/erhant/circomkit).

## Style

Check the formatting with the following command:

```sh
yarn format
```

This command checks the test code with [Prettier](https://www.npmjs.com/package/prettier).
