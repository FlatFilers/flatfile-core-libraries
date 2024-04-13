---
'@flatfile/hooks': minor
---

## New Features

- Introduces a `setReadOnly` method to make entire records or specific fields read-only inside hooks.
- Introduces a `setWritable` method to make entire records or specific fields writable inside hooks.
- Introduced new functionality to return the record state as key-value pairs (`record.obj`)

## Bug Fixes

Improved error handling in the set method when field verification fails.
