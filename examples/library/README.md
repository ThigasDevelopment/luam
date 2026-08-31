# @luam-example/collections

The library the manual consumes in [Using a library](../../docs/en/recipes/using-a-library.md).

It ships one class compiled from `.luam`, and one verbatim `.lua` file with a
`.d.luam` beside it, so both halves of the model appear in one package. Its
layout lives in the `luam` field of `package.json`; the consuming project lists
the package in `libraries` and installs it with its own package manager.
