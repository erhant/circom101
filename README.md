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

We use `mdbook` to create the book, see the [book](./book/) folder. Serve the book locally with:

```sh
yarn book
yarn book:build # without serving
```

## Tests

Run circuit tests with:

```sh
yarn test
```

The tests make use of [Circomkit](https://github.com/erhant/circomkit).
