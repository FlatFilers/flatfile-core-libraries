# @flatfile/listener

## 0.4.1

### Patch Changes

- 066c2cb9: Update Exports

## 0.4.0

### Minor Changes

- 1eedc59: Replace axios with fetch

## 0.3.19

### Patch Changes

- 8823223: Add pako compression to the event.update() by default

## 0.3.18

### Patch Changes

- 703b6b6: Resolved issue with the EventCallback type not expecting a promise

## 0.3.17

### Patch Changes

- c8379f0: Fixes an issue where axios and its http method are not available

## 0.3.16

### Patch Changes

- 6f39196: Adds umd build type for working with CDNs

## 0.3.15

### Patch Changes

- 7369c63: Fix spammy 304 errors
- 4fd707e: Create secrets cache based on environmentId and spaceId
- 6a5fdea: Adds createdAt to FlatfileEvent
- cc954c1: Ensures Single Trailing Slash In API URL

## 0.3.14

### Patch Changes

- 4af28f7: event.secrets now defaults to spaceId, and will throw if no environmentId is available for secrets retrieval

## 0.3.13

### Patch Changes

- 1db5dc7: Remove includeCounts by defaul in event.data

## 0.3.12

### Patch Changes

- ac21304: Pass in URL params to enable pagination with event.data()

## 0.3.11

### Patch Changes

- cbacf2a: Update semver version > 7.5.2

  resolves https://security.snyk.io/vuln/SNYK-JS-SEMVER-3247795

## 0.3.10

### Patch Changes

- ad5cf83: Adds Secrets to Event
- ce3386c: Fixes bug with nested event.src

## 0.3.9

### Patch Changes

- e8eff5c: Adds namespace functionality

## 0.3.8

### Patch Changes

- 6b64f31: adding readme files

## 0.3.7

### Patch Changes

- dcc0267: Update event.update()

## 0.3.6

### Patch Changes

- 5298150: Fix issues that prevent extensibility of FlatfileListener

## 0.3.5

### Patch Changes

- db6ff92: after all callbacks now resolve before the promise completes

## 0.3.4

### Patch Changes

- c624a67: Add `event.update(data)` method
- 91c2e75: Adds `origin` to FlatfileEvent

## 0.3.3

### Patch Changes

- 52fa034: cleans up dist

## 0.3.2

### Patch Changes

- 84f6807: resolves a minor bug with afterAll callbacks and adds recursive listener introspection

## 0.3.1

### Patch Changes

- 9ca9443: Event Cache Cleanup

## 0.3.0

### Minor Changes

- 2a30e13: Add cross-env library for accessing environment variables

## 0.2.0

### Minor Changes

- 637342b: Remove @flatfile/api from listener

## 0.1.2

### Patch Changes

- 22d2466: Pull last 5 seconds of events in Polling Driver

## 0.1.1

### Patch Changes

- 356c35d: Minor CI improvements and backwards compatible rename of Client to FlatfileListener

## 0.1.0

### Minor Changes

- 4d88069: Adds a major improvement to event filtering, allowing you to grep the key path and defaulting to matching any key in the object

## 0.0.10

### Patch Changes

- 4807720: removes unused node dependencies
- 82e80e3: Add in x-disable-hooks header

## 0.0.9

### Patch Changes

- 46357d9: flatfile deploy and develop

## 0.0.8

### Patch Changes

- 74852f3: Adds Event Cache
- 65aea7a: Adds conditional fetchApi variable to authenticated client to allow for client-side use

## 0.0.7

### Patch Changes

- Updated dependencies [72447b1]
  - @flatfile/hooks@1.3.0

## 0.0.6

### Patch Changes

- 4039970: Adds 'x-disable-hooks': 'true' to event payload to x

## 0.0.5

### Patch Changes

- 55f9fff: Update API version and use configless space creation in listener example.
- Updated dependencies [55f9fff]
  - @flatfile/schema@0.2.15

## 0.0.4

### Patch Changes

- 8ed4e8c: Bumps API version and adds support for record metadata to @flatfile/hooks.
- Updated dependencies [8ed4e8c]
  - @flatfile/schema@0.2.14
  - @flatfile/hooks@1.2.4

## 0.0.3

### Patch Changes

- c946831: Updates to use the dataUrl for getting records

## 0.0.2

### Patch Changes

- 2e25be3: Update packages with updated @flatfile/api
- Updated dependencies [2e25be3]
  - @flatfile/schema@0.2.13

## 0.0.1

### Patch Changes

- 4b918a2: Adds the new @flatfile/listener package
