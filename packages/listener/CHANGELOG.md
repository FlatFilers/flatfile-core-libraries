# @flatfile/listener

## 1.1.0

### Minor Changes

- 4b25544: Support for user-level secrets in the SDK by introducing an optional actorId parameter to the secrets method. This allows fetching and managing secrets scoped to a specific actor without affecting existing behavior.

## 1.0.5

### Patch Changes

- bac639c: Adds `listener.unmount()` to `@flatfile/listener`
- bac639c: Adds resetting Space on Close to @flatfile/react, adds DefaultPage to @flatfile/react

## 1.0.4

### Patch Changes

- e8bc980: Speed up our build tooling!

## 1.0.3

### Patch Changes

- efcb757: Update Dependencies

## 1.0.2

### Patch Changes

- d13ceb6: Adds helper functions needed in the Refactor React to use a FlatfileContext and Components to configure the Space

## 1.0.1

### Patch Changes

- 9b6c7b2: Update package.json to have exports and browser

## 1.0.0

#### 2024-02-07

### Major Changes

- 56388f0: Update package.json to use exports nested entrypoints

## 0.4.2

#### 2024-01-31

### Patch Changes

- 2ed22cb: Fix to help separate types from conflicting peer dependencies

## 0.4.1

#### 2024-01-26

### Patch Changes

- 066c2cb9: Update Exports

## 0.4.0

#### 2024-01-09

### Minor Changes

- 1eedc59: Replace axios with fetch

## 0.3.19

#### 2024-01-05

### Patch Changes

- 8823223: Add pako compression to the event.update() by default

## 0.3.18

#### 2024-01-03

### Patch Changes

- 703b6b6: Resolved issue with the EventCallback type not expecting a promise

## 0.3.17

#### 2023-11-07

### Patch Changes

- c8379f0: Fixes an issue where axios and its http method are not available

## 0.3.16

#### 2023-11-06

### Patch Changes

- 6f39196: Adds umd build type for working with CDNs

## 0.3.15

#### 2023-08-18

### Patch Changes

- 7369c63: Fix spammy 304 errors
- 4fd707e: Create secrets cache based on environmentId and spaceId
- 6a5fdea: Adds createdAt to FlatfileEvent
- cc954c1: Ensures Single Trailing Slash In API URL

## 0.3.14

#### 2023-08-11

### Patch Changes

- 4af28f7: event.secrets now defaults to spaceId, and will throw if no environmentId is available for secrets retrieval

## 0.3.13

#### 2023-07-25

### Patch Changes

- 1db5dc7: Remove includeCounts by defaul in event.data

## 0.3.12

#### 2023-07-25

### Patch Changes

- ac21304: Pass in URL params to enable pagination with event.data()

## 0.3.11

#### 2023-07-17

### Patch Changes

- cbacf2a: Update semver version > 7.5.2
  - resolves https://security.snyk.io/vuln/SNYK-JS-SEMVER-3247795

## 0.3.10

#### 2023-06-28

### Patch Changes

- ad5cf83: Adds Secrets to Event
- ce3386c: Fixes bug with nested event.src

## 0.3.9

#### 2023-06-16

### Patch Changes

- e8eff5c: Adds namespace functionality

## 0.3.8

#### 2023-06-15

### Patch Changes

- 6b64f31: adding readme files

## 0.3.7

#### 2023-06-13

### Patch Changes

- dcc0267: Update event.update()

## 0.3.6

#### 2023-06-09

### Patch Changes

- 5298150: Fix issues that prevent extensibility of FlatfileListener

## 0.3.5

#### 2023-06-09

### Patch Changes

- db6ff92: after all callbacks now resolve before the promise completes

## 0.3.4

#### 2023-06-02

### Patch Changes

- c624a67: Add `event.update(data)` method
- 91c2e75: Adds `origin` to FlatfileEvent

## 0.3.3

#### 2023-05-31

### Patch Changes

- 52fa034: cleans up dist

## 0.3.2

#### 2023-05-31

### Patch Changes

- 84f6807: resolves a minor bug with afterAll callbacks and adds recursive listener introspection

## 0.3.1

#### 2023-05-25

### Patch Changes

- 9ca9443: Event Cache Cleanup

## 0.3.0

#### 2023-05-19

### Minor Changes

- 2a30e13: Add cross-env library for accessing environment variables

## 0.2.0

#### 2023-05-19

### Minor Changes

- 637342b: Remove @flatfile/api from listener

## 0.1.2

#### 2023-05-16

### Patch Changes

- 22d2466: Pull last 5 seconds of events in Polling Driver

## 0.1.1

#### 2023-05-15

### Patch Changes

- 356c35d: Minor CI improvements and backwards compatible rename of Client to FlatfileListener

## 0.1.0

#### 2023-05-14

### Minor Changes

- 4d88069: Adds a major improvement to event filtering, allowing you to grep the key path and defaulting to matching any key in the object

## 0.0.10

#### 2023-05-14

### Patch Changes

- 4807720: removes unused node dependencies
- 82e80e3: Add in x-disable-hooks header

## 0.0.9

#### 2023-05-12

### Patch Changes

- 46357d9: flatfile deploy and develop

## 0.0.8

#### 2023-05-05

### Patch Changes

- 74852f3: Adds Event Cache
- 65aea7a: Adds conditional fetchApi variable to authenticated client to allow for client-side use

## 0.0.7

#### 2023-05-01

### Patch Changes

- Updated dependencies [72447b1]
  - @flatfile/hooks@1.3.0

## 0.0.6

#### 2023-04-25

### Patch Changes

- 4039970: Adds 'x-disable-hooks': 'true' to event payload to x

## 0.0.5

#### 2023-04-17

### Patch Changes

- 55f9fff: Update API version and use configless space creation in listener example.
- Updated dependencies [55f9fff]
  - @flatfile/schema@0.2.15

## 0.0.4

#### 2023-04-04

### Patch Changes

- 8ed4e8c: Bumps API version and adds support for record metadata to @flatfile/hooks.
- Updated dependencies [8ed4e8c]
  - @flatfile/schema@0.2.14
  - @flatfile/hooks@1.2.4

## 0.0.3

#### 2023-03-22

### Patch Changes

- c946831: Updates to use the dataUrl for getting records

## 0.0.2

#### 2023-03-14

### Patch Changes

- 2e25be3: Update packages with updated @flatfile/api
- Updated dependencies [2e25be3]
  - @flatfile/schema@0.2.13

## 0.0.1

#### Date not provided

### Patch Changes

- 4b918a2: Adds the new @flatfile/listener package
