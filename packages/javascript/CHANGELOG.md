# @flatfile/javascript

## 1.5.7

### Patch Changes

- bd82163: Prevents loading historical events when reusing existing spaces

## 1.5.6

### Patch Changes

- d145e67: Update sync-xhr settings for embedded iframe

## 1.5.5

### Patch Changes

- dfe1b5f: Adds externalActorId to the React and Javascript packages to enable repeat guests for portal users
- Updated dependencies [dfe1b5f]
  - @flatfile/embedded-utils@1.3.6

## 1.5.4

### Patch Changes

- 4b21272: This release translates the "Starting job" message
- Updated dependencies [4b21272]
  - @flatfile/embedded-utils@1.3.5

## 1.5.3

### Patch Changes

- 950aa70: This release translates the "Submit" button

## 1.5.2

### Patch Changes

- ba4e241: Fix UMD build by removing externals

## 1.5.1

### Patch Changes

- 5b2b3b0: This release cleans up the packages' builds by removing the Node builds and reverting the UMD build file name back to index.js.

## 1.5.0

### Minor Changes

- bf1c93a: This release swaps the package's bundler.

## 1.4.4

### Patch Changes

- 8a4c06a: Update Angular to use the @flatfile/javascript functions
- Updated dependencies [8a4c06a]
  - @flatfile/embedded-utils@1.3.4

## 1.4.3

### Patch Changes

- Updated dependencies [bf1a718]
  - @flatfile/embedded-utils@1.3.2

## 1.4.2

### Patch Changes

- 7b8cda2: JavaScript: Portal style sheet is now only attached once, instead of every time the Portal is opened.
- d6e80ce: JavaScript: allow specifying submit complete options
- Updated dependencies [d6e80ce]
  - @flatfile/embedded-utils@1.3.1

## 1.4.1

### Patch Changes

- 0b66de8: export startFlatfile as well as initializeFlatfile

## 1.4.0

### Minor Changes

- 8cf905a: Add internationalization support with detected browser language or given override language.

## 1.3.10

### Patch Changes

- 38dc4a3: Update Rollup configuration to UMD build

## 1.3.9

### Patch Changes

- 61aced2: Use updated embedded-utils to avoid registering two 'message' event handlers
- Updated dependencies [61aced2]
  - @flatfile/embedded-utils@1.3.0

## 1.3.8

### Patch Changes

- 3af5fbf: Improved functionality and fixed some issues with `closeSpace.onClose()`

## 1.3.7

### Patch Changes

- 7e0d063: Adds a way to set the defaultPage when preloading the Portal embed
- Updated dependencies [7e0d063]
  - @flatfile/embedded-utils@1.2.4

## 1.3.6

### Patch Changes

- e8bc980: Speed up our build tooling!
- Updated dependencies [e8bc980]
  - @flatfile/embedded-utils@1.2.3
  - @flatfile/listener@1.0.4

## 1.3.5

### Patch Changes

- efcb757: Update Dependencies
- Updated dependencies [efcb757]
  - @flatfile/embedded-utils@1.2.2
  - @flatfile/listener@1.0.3

## 1.3.4

### Patch Changes

- 9228a00: Makes closeSpace.operation and closeSpace.onClose optional
- Updated dependencies [9228a00]
  - @flatfile/embedded-utils@1.2.1

## 1.3.3

### Patch Changes

- 86c7505: Fix to allow clipboard read and write in embedded iframe components
- Updated dependencies [003014c]
  - @flatfile/embedded-utils@1.2.0

## 1.3.2

### Patch Changes

- Updated dependencies [f89a6de]
  - @flatfile/embedded-utils@1.1.14

## 1.3.1

### Patch Changes

- Updated dependencies [8ef2d53]
  - @flatfile/embedded-utils@1.1.13

## 1.3.0

### Minor Changes

- e07368c: incorporate new init capability for preload - resulting in single-endpoint requests when creating spaces, workbooks, and documents

### Patch Changes

- 6952740: Make environmentId optional
- Updated dependencies [6952740]
  - @flatfile/embedded-utils@1.1.12

## 1.2.6

### Patch Changes

- 5263f5b: Fix to only include defined params in the space creation request

## 1.2.5

### Patch Changes

- ab0388b: Update params for the embedded wrapper initializers
- Updated dependencies [ab0388b]
  - @flatfile/embedded-utils@1.1.11

## 1.2.4

### Patch Changes

- 399a9f4: Update Workbook types to include all params
- Updated dependencies [399a9f4]
  - @flatfile/embedded-utils@1.1.10

## 1.2.3

### Patch Changes

- c92bcdb: Updates default spaces url to https://platform.flatfile.com/s in order to avoid unnecessary preflight requests.

## 1.2.2

### Patch Changes

- 9b6c7b2: Update `package.json` to have `exports` and `browser`
- 9b6c7b2: fix typo in package.json
- Updated dependencies [9b6c7b2]
  - @flatfile/listener@1.0.1

## 1.2.1

#### 2024-02-07

### Patch Changes

- d3e68f1: Update types for all packages that reference the `@flatfile/plugin-record-hook` plugin.

## 1.2.0

#### 2024-02-07

### Minor Changes

- 56388f0: Update package.json to use exports nested entrypoints.

### Patch Changes

- bad8369: Include Peer Deps in Javascript UMD build.
- Updated dependencies [56388f0]
  - @flatfile/listener@1.0.0
  - @flatfile/embedded-utils@1.1.9.

## 1.1.8

#### 2024-02-06

### Patch Changes

- 1daeef6: fix: remove listeners logic.

## 1.1.7

#### 2024-02-06

### Patch Changes

- 4528907: Remove global style overrides from sdks.

## 1.1.6

#### 2024-02-01

### Patch Changes

- 76284d9: remove listener after complete submit and close action.

## 1.1.5

#### 2024-01-31

### Patch Changes

- fa5e8fe: Update package.json structure.
- 2ed22cb: Fix to help separate types from conflicting peer dependencies.
- Updated dependencies [2ed22cb]
  - @flatfile/embedded-utils@1.1.8
  - @flatfile/listener@0.4.2.

## 1.1.4

#### 2024-01-30

### Patch Changes

- f07d0459: Update close action to be independent of user params.

## 1.1.3

#### 2024-01-26

### Patch Changes

- 066c2cb9: Update Exports.
- Updated dependencies [066c2cb9]
  - @flatfile/listener@0.4.1.

## 1.1.2

#### 2024-01-24

### Patch Changes

- 6355950: fix issue when reusing space.

## 1.1.1

#### 2024-01-19

### Patch Changes

- 9225c80: Update deps.
- 4d48e58: Fix potential issue of assuming preload based on existing mountElement instead of checking for mountElement's iFrame.

## 1.1.0

#### 2024-01-19

### Minor Changes

- 34b7861: Introduces a new utility allowing the JS Flatfile embed to be preloaded in the background.

## 1.0.0

#### 2024-01-12

### Major Changes

- aa450d6: Remove Pubnub From @flatfile/javascript.

### Patch Changes

- f6c0122: Fixing alignment of close buttons to not be half-in the modal.
- 62f5ef3: add event to submit context.
- Updated dependencies [62f5ef3]
  - @flatfile/embedded-utils@1.1.5.

## 0.3.2

#### 2024-01-09

### Patch Changes

- Updated dependencies [1eedc59]
  - @flatfile/listener@0.4.0
  - @flatfile/embedded-utils@1.1.2.

## 0.3.1

#### 2023-12-21

### Patch Changes

- 2429f55: Update umd build file.

## 0.3.0

#### 2023-12-20

### Minor Changes

- dcfee6a: Optimize bundles.

### Patch Changes

- 1507df1: Add option to keep space after submit.
- Updated dependencies [dcfee6a]
- Updated dependencies [1507df1]
  - @flatfile/embedded-utils@1.1.0.

## 0.2.2

#### 2023-12-13

### Patch Changes

- 546e5b2: Update dependencies and add the Simplified React Flow.
- 546e5b2: Remove unneeded dependency.
- 61ef469: Update default submit label.
- Updated dependencies [546e5b2]
  - @flatfile/embedded-utils@1.0.9.

## 0.2.1

#### 2023-11-28

### Patch Changes

- 96bd18a: Re-adds the initializeFlatfile method for continued use, fixes an issue with the submit action not creating properly, and updates the simple app to be a hidden app.

## 0.2.0

#### 2023-11-27

### Minor Changes

- de13f8d: Simplified implementation flow.

### Patch Changes

- Updated dependencies [de13f8d]
  - @flatfile/embedded-utils@1.0.8.

## 0.1.27

#### 2023-11-10

### Patch Changes

- dea361d: Include all Workbook Params in Creation.

## 0.1.26

#### 2023-11-09

### Patch Changes

- 585d15f: Remove console.log().

## 0.1.25

#### 2023-11-01

### Patch Changes

- 6f39196: Adds umd build type for working with CDNs.
- Updated dependencies [6f39196]
  - @flatfile/listener@0.3.16.

## 0.1.24

#### 2023-10-30

### Patch Changes

- 2961b32: Update embedded-utils.
- Updated dependencies [ca7ad43]
  - @flatfile/embedded-utils@1.0.7.

## 0.1.23

#### 2023-10-26

### Patch Changes

- 7510f2e: Remove unneeded dependency.

## 0.1.22

#### 2023-10-19

### Patch Changes

- 42f7ff9: Use rollup.js for bundling.

## 0.1.21

#### 2023-10-19

### Patch Changes

- 8d381a7: upgrade api version.
- Updated dependencies [8d381a7]
  - @flatfile/embedded-utils@1.0.6.

## 0.1.20

#### 2023-10-18

### Patch Changes

- ce8e954: remove env setup.

## 0.1.19

#### 2023-10-11

### Patch Changes

- eea092c: upgrade deps version.

## 0.1.18

#### 2023-09-29

### Patch Changes

- 81d1511: return spaceId on js wrapper.

## 0.1.17

#### 2023-09-27

### Patch Changes

- 72d84bb: Add label for embeedded spaces.
- 647bb69: Create listener before workbook creation.

## 0.1.16

#### 2023-09-22

### Patch Changes

- 087ac36: fix metadata not being set by spaceBody.
- Updated dependencies [087ac36]
  - @flatfile/embedded-utils@1.0.5.

## 0.1.15

#### 2023-09-21

### Patch Changes

- 7d5b16a: readme update.

## 0.1.14

#### 2023-09-20

### Patch Changes

- ebd148e: Close button style improvements.

## 0.1.13

#### 2023-09-20

### Patch Changes

- 238a864: Update dependencies.

## 0.1.12

#### 2023-09-20

### Patch Changes

- 13cddf9: Update to pull env vars and update accessToken.

## 0.1.11

#### 2023-09-13

### Patch Changes

- c772615: set sidebarConfig hiding sidebar by default.
- 7a6a5ae: autoConfigure as true when no workbook set.

## 0.1.10

#### 2023-09-13

### Patch Changes

- 0b65086: Add needed dependencies.

## 0.1.9

#### 2023-09-12

### Patch Changes

- bd5c297: Bundle ts for umd.

## 0.1.8

#### 2023-09-12

### Patch Changes

- 5b09d7b: adding class names to error container.

## 0.1.7

#### 2023-08-30

### Patch Changes

- e6dcd63: Sync sdk with docs, add parameters for exit buttons text.
- 148ed7a: workbook optional on interfaces.

## 0.1.6

#### 2023-08-01

### Patch Changes

- b0a6b63: Update dependencies.

## 0.1.5

#### 2023-07-27

### Patch Changes

- 5048bf9: Fix error display logic.

## 0.1.4

#### 2023-07-26

### Patch Changes

- 191fbf4: Display clean error on failure to load.
- 0cf8e20: check for success on outcome acknowledged event.
- 59b95b0: allows you to add addl space props.

## 0.1.3

#### 2023-07-24

### Patch Changes

- 6d43bbd: envId no longer required.

## 0.1.2

#### 2023-07-20

### Patch Changes

- 6b624fd: added spinner while loading.

## 0.1.1

#### 2023-07-20

### Patch Changes

- f0b6cda: fix for coalescing.

## 0.1.0

#### 2023-07-19

### Minor Changes

- 4eb89b8: readme updates, improvements to the javascript package.
