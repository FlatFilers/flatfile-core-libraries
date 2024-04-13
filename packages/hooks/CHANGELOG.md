# @flatfile/hooks

## 1.4.0

### Minor Changes

- 107cc00:
  - Introduces a `setReadOnly` method to make entire records or specific fields read-only inside hooks.
  - Introduces a `setWritable` method to make entire records or specific fields writable inside hooks.
  - Introduced new functionality to return the record state as key-value pairs (`record.obj`)
  - Improved error handling in the set method when field verification fails.

## 1.3.2

### Patch Changes

- c631598: Bug fix in getLinks that returned a string instead of an array in some cases
- c631598: Add return type to getLinks()

## 1.3.1

### Patch Changes

- 6b64f31: adding readme files

## 1.3.0

### Minor Changes

- 72447b1: Adds compute, transform, and validate methods to FlatfileRecord.

## 1.2.4

### Patch Changes

- 8ed4e8c: Bumps API version and adds support for record metadata to @flatfile/hooks.

## 1.2.3

### Patch Changes

- 8a2463f: Adds support for stageVisibility:{ mapping:false } to XDK

## 1.2.2

### Patch Changes

- fa1694c: Adds getLinks() to Flatfile Record to include linked record values in Hook code

## 1.2.1

### Patch Changes

- 745a73e: XDK publishing

## 1.2.0

### Minor Changes

- 5819944: Alpha base functionality
