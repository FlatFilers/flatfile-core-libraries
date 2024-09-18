# @flatfile/react

## 7.12.4

### Patch Changes

- cc58f40: Fixes a bug when relaunching a re-used space
- 8eae8fa: Fix bug causing "Maximum update depth exceeded" React error when multiple Portals are used within the same FlatfileProvider (this is not supported).

## 7.12.3

### Patch Changes

- b3f88bf: Fix bug with Workbook onSubmit

## 7.12.2

### Patch Changes

- 0ea5677: Fix to allow seamless changing of Sheet config between opening the Portal instance

## 7.12.1

### Patch Changes

- 6ca035f: Fixes a bug where the space was not completely reset upon close of the Flatfile Portal

## 7.12.0

### Minor Changes

- 794560a: Adds new useFlatfile({ onClose }) close event handler on useFlatfile hook
  Restores missing stylesheet for legacy deprecated useSpace and usePortal flows
  Flatfile modal now fills entire screen by default, style overrides may need to be adjusted

### Patch Changes

- 339773c: Fixes bug preventing server side configuration of Spaces

## 7.11.1

### Patch Changes

- 8bdf04f: Fix for adding and changing listeners when not inline

## 7.11.0

### Minor Changes

- 85e0ffd: Replaced CSS text color variable name to be consistent with other variable names, --ff-color-text is now --ff-text-color

## 7.10.0

### Minor Changes

- 25a89ef: Adds `styleSheetOptions` to `FlatfileProvider` config for setting nonce value and postion of injected stylesheet

## 7.9.10

### Patch Changes

- c5dda87: Prevents Flatfile modal from blocking scroll on some browsers when closed.

## 7.9.9

### Patch Changes

- 5672245: Fix for some instances where the iframe wasn't ready when the `portal:initialize` call was posted

## 7.9.8

### Patch Changes

- ad7695f: Adds more control over Opening Portal

## 7.9.7

### Patch Changes

- 521b423: Better typing and organization
- Updated dependencies [7e0d063]
  - @flatfile/embedded-utils@1.2.4

## 7.9.6

### Patch Changes

- bac639c: Fixes bug where ISO dates were automatically converted to JS Dates
- Updated dependencies [bac639c]
- Updated dependencies [bac639c]
  - @flatfile/listener@1.0.5

## 7.9.5

### Patch Changes

- e8bc980: Speed up our build tooling!
- Updated dependencies [e8bc980]
  - @flatfile/cross-env-config@0.0.6
  - @flatfile/embedded-utils@1.2.3
  - @flatfile/listener@1.0.4

## 7.9.4

### Patch Changes

- efcb757: Update Dependencies
- Updated dependencies [efcb757]
  - @flatfile/embedded-utils@1.2.2
  - @flatfile/listener@1.0.3

## 7.9.3

### Patch Changes

- 9228a00: Makes closeSpace.operation and closeSpace.onClose optional
- Updated dependencies [9228a00]
  - @flatfile/embedded-utils@1.2.1

## 7.9.2

### Patch Changes

- 1473f79: Fixes bug with re-using spaces
- 86c7505: Fix to allow clipboard read and write in embedded iframe components
- Updated dependencies [003014c]
  - @flatfile/embedded-utils@1.2.0

## 7.9.1

### Patch Changes

- da48813: Updates onSubmit action handlers to add acknowledge: true to the job

## 7.9.0

### Minor Changes

- d13ceb6: Refactor React to use a FlatfileContext and Components to configure the Space

### Patch Changes

- Updated dependencies [d13ceb6]
  - @flatfile/embedded-utils@1.1.15
  - @flatfile/listener@1.0.2

## 7.8.12

### Patch Changes

- Updated dependencies [f89a6de]
  - @flatfile/embedded-utils@1.1.14

## 7.8.11

### Patch Changes

- Updated dependencies [8ef2d53]
  - @flatfile/embedded-utils@1.1.13

## 7.8.10

### Patch Changes

- 16c42ce: Fix bug with onSubmit() in the usePortal hook

## 7.8.9

### Patch Changes

- 6952740: Make environmentId optional
- Updated dependencies [6952740]
  - @flatfile/embedded-utils@1.1.12

## 7.8.8

### Patch Changes

- 10b4d14: Fixes a bug where the embedded iframe would not be removed if there was an error.

## 7.8.7

### Patch Changes

- 5263f5b: Fix to only include defined params in the space creation request

## 7.8.6

### Patch Changes

- ab0388b: Update params for the embedded wrapper initializers
- Updated dependencies [ab0388b]
  - @flatfile/embedded-utils@1.1.11

## 7.8.5

### Patch Changes

- 399a9f4: Update Workbook types to include all params
- Updated dependencies [399a9f4]
  - @flatfile/embedded-utils@1.1.10

## 7.8.4

### Patch Changes

- c92bcdb: Updates default spaces url to https://platform.flatfile.com/s in order to avoid unnecessary preflight requests.

## 7.8.3

### Patch Changes

- b3fa3ee: Fixes a bug with updating the `@flatfile/listener` authentication token

## 7.8.2

#### 2024-02-07

### Patch Changes

- 9b6c7b2: Update package.json to have exports and browser
- Updated dependencies [9b6c7b2]
  - @flatfile/listener@1.0.1

## 7.8.1

#### 2024-02-07

### Patch Changes

- d3e68f1: Update types for all packages that reference the record-hook plugin.

## 7.8.0

#### 2024-02-07

### Minor Changes

- 56388f0: Update package.json to use exports nested entrypoints.
- Updated dependencies [56388f0]
  - @flatfile/listener@1.0.0
  - @flatfile/embedded-utils@1.1.9

## 7.7.4

#### 2024-02-06

### Patch Changes

- 4528907: Remove global style overrides from sdks.

## 7.7.3

#### 2024-01-31

### Patch Changes

- 2ed22cb: Fix to help separate types from conflicting peer dependencies.
- Updated dependencies [2ed22cb]
  - @flatfile/embedded-utils@1.1.8
  - @flatfile/listener@0.4.2

## 7.7.2

#### 2024-01-30

### Patch Changes

- f07d0459: Update close action to be independent of user params.

## 7.7.1

#### 2024-01-19

### Patch Changes

- 9225c80: Update deps.

## 7.7.0

#### 2024-01-19

### Minor Changes

- ea7bd15: Add initSpace().
- Updated dependencies [ea7bd15]
  - @flatfile/embedded-utils@1.1.6

## 7.6.1

#### 2024-01-12

### Patch Changes

- f6c0122: Fixing alignment of close buttons to not be half-in the modal.
- 62f5ef3: Add event to submit context.
- Updated dependencies [62f5ef3]
  - @flatfile/embedded-utils@1.1.5

## 7.6.0

#### 2024-01-10

### Minor Changes

- 8d6cf2f: Remove Pubnub from @flatfile/react.
- Updated dependencies [8d6cf2f]
  - @flatfile/embedded-utils@1.1.4

## 7.5.4

#### 2024-01-10

### Patch Changes

- f3a9f69: Bundle @flatfile/api for the react package.
- Updated dependencies [f3a9f69]
  - @flatfile/embedded-utils@1.1.3

## 7.5.3

#### 2024-01-09

### Patch Changes

- Updated dependencies [1eedc59]
  - @flatfile/listener@0.4.0
  - @flatfile/embedded-utils@1.1.2

## 7.5.2

#### 2024-01-08

### Patch Changes

- c91e356: Update to remove styled-components.

## 7.5.1

#### 2023-12-21

### Patch Changes

- 2429f55: Update UMD file name.

## 7.5.0

#### 2023-12-20

### Minor Changes

- dcfee6a: Optimize bundles.
- Updated dependencies [dcfee6a]
- Updated dependencies [1507df1]
  - @flatfile/embedded-utils@1.1.0

## 7.4.0

#### 2023-12-13

### Minor Changes

- 546e5b2: Update dependencies and add the Simplified React Flow.
- Updated dependencies [546e5b2]
- Updated dependencies [546e5b2]
  - @flatfile/embedded-utils@1.0.9

## 7.3.1

#### 2023-12-01

### Patch Changes

- 15fe469: Improve nomenclature.

## 7.3.0

#### 2023-11-15

### Minor Changes

- 6149ffa: Create useSpaceTrigger to control when to consume Flatfile.

## 7.2.34

#### 2023-11-10

### Patch Changes

- dea361d: Include all Workbook Params in Creation.

## 7.2.33

#### 2023-11-09

### Patch Changes

- e280f69: Fix dependency issue.

## 7.2.32

#### 2023-11-09

### Patch Changes

- 775c6d2: Remove styled-components from peer deps.

## 7.2.31

#### 2023-11-01

### Patch Changes

- ca7ad43: Updating versions, and removing unused packages.
- Updated dependencies [ca7ad43]
  - @flatfile/embedded-utils@1.0.7

## 7.2.30

#### 2023-10-30

### Patch Changes

- 7510f2e: Remove unneeded dependency.

## 7.2.29

#### 2023-10-26

### Patch Changes

- 42f7ff9: Use rollup.js for bundling.

## 7.2.28

#### 2023-10-19

### Patch Changes

- d1028fe: Updated deps.

## 7.2.27

#### 2023-10-16

### Patch Changes

- eea092c: Upgrade deps version.

## 7.2.26

#### 2023-10-15

### Patch Changes

- 23fbbc0: Add default colors on close modal.

## 7.2.25

#### 2023-10-10

### Patch Changes

- 3f65a7f: Fix to stroke-width.

## 7.2.24

#### 2023-09-29

### Patch Changes

- 72d84bb: Add label for embedded spaces.
- 647bb69: Create listener before workbook creation.
- 87ce5b1: Updated API version.

## 7.2.23

#### 2023-09-27

### Patch Changes

- 087ac36: Fix metadata not being set by spaceBody.
- Updated dependencies [087ac36]
  - @flatfile/embedded-utils@1.0.5

## 7.2.22

#### 2023-09-21

### Patch Changes

- ebd148e: Close button style improvements.

## 7.2.21

#### 2023-09-20

### Patch Changes

- c772615: Set sidebarConfig hiding sidebar by default.
- 7a6a5ae: AutoConfigure as true when no workbook set.

## 7.2.20

#### 2023-09-12

### Patch Changes

- 39af196: Upgrade embedded-utils version.
- 5b09d7b: Adding class names to error container.

## 7.2.19

#### 2023-09-12

### Patch Changes

- e6dcd63: Sync SDK with docs, add parameters for exit buttons text.
- 148ed7a: Workbook optional on interfaces.
- Updated dependencies [e6dcd63]
- Updated dependencies [148ed7a]
  - @flatfile/embedded-utils@1.0.4

## 7.2.18

#### 2023-08-30

### Patch Changes

- 7c1c0df: Add class names on the dialog.
- b0a6b63: Move examples into apps/react and cleanup.
- Updated dependencies [b0a6b63]
  - @flatfile/embedded-utils@1.0.3

## 7.2.17

#### 2023-08-24

### Patch Changes

- 7457f1e: Adding userInfo param on metadata.

## 7.2.16

#### 2023-08-18

### Patch Changes

- Updated dependencies [7369c63]
- Updated dependencies [4fd707e]
- Updated dependencies [6a5fdea]
  - @flatfile/listener@0.3.15

## 7.2.15

#### 2023-08-17

### Patch Changes

- 7afbe80: Allow spaceBody.

## 7.2.14

#### 2023-08-11

### Patch Changes

- 1102501: Make close button and iframe have a proper class name for overrides.
- Updated dependencies [4af28f7]
  - @flatfile/listener@0.3.14

## 7.2.13

#### 2023-08-03

### Patch Changes

- c724639: Add fallback for guestlink.

## 7.2.12

#### 2023-08-02

### Patch Changes

- f78e6f4: Make environmentId required.

## 7.2.11

#### 2023-08-01

### Patch Changes

- 6f96176: Add configurable url to reusable spaces.
- dc01f53: No environment required.
- 8b2349a: Enable modal/inline functionality for react package.
- Updated dependencies [c631598]
  - @flatfile/hooks@1.3.2

## 7.2.10

#### 2023-07-27

### Patch Changes

- ecceaf2: Reusable Spaces for Embedded React.
- 0cf8e20: Check for success on outcome acknowledged event.
- 1c9a37f: Enable apiUrl configuration.

## 7.2.9

#### 2023-07-25

### Patch Changes

- Updated dependencies [1db5dc7]
  - @flatfile/configure@0.5.37.
  - @flatfile/listener@0.3.13.

## 7.2.8

#### 2023-07-25

### Patch Changes

- Updated dependencies [5234a66]
  - @flatfile/configure@0.5.36.
  - @flatfile/listener@0.3.12.

## 7.2.7

#### 2023-07-24

### Patch Changes

- 027bac8: Add custom mount element.
- 7f70fc9: Allow ability to configure exit text and title prompts.

## 7.2.6

#### 2023-07-21

### Patch Changes

- Updated dependencies [77b6c3a]
  - @flatfile/configure@0.5.35.

## 7.2.5

#### 2023-07-20

### Patch Changes

- 4eb89b8: Readme updates, improvements to the javascript package.

## 7.2.4

#### 2023-07-19

### Patch Changes

- 713699b: Update dependency degenerator to remove vm2 for a security vulnerability.

## 7.2.3

#### 2023-07-17

### Patch Changes

- cbacf2a: Update semver version > 7.5.2 to resolve https://security.snyk.io/vuln/SNYK-JS-SEMVER-3247795.
- Updated dependencies [cbacf2a]
  - @flatfile/cross-env-config@0.0.5.
  - @flatfile/listener@0.3.11.

## 7.2.2

#### 2023-07-10

### Patch Changes

- Updated dependencies [1575f8c]
  - @flatfile/configure@0.5.34.

## 7.2.1

#### 2023-07-01

### Patch Changes

- ce3386c: Fix bug with nested event.src.
- Updated dependencies [ad5cf83]
- Updated dependencies [ce3386c]
  - @flatfile/listener@0.3.10.

## 7.2.0

#### 2023-06-30

### Minor Changes

- b4b2bc5: Adds support for up to React 18.

### Patch Changes

- b4b2bc5: Fix to import index.css color variables.

## 7.1.0

#### 2023-06-27

### Minor Changes

- d0d17ee: Adds support for up to React 18.

## 7.0.0

#### 2023-06-20

### Major Changes

- 141e333: Add fallback for Pubnub connection and refactor useSpace.

## 6.1.3

#### 2023-06-16

### Patch Changes

- Updated dependencies [e8eff5c]
  - @flatfile/listener@0.3.9.

## 6.1.2

#### 2023-06-15

### Patch Changes

- 6b64f31: Adding readme files.
- Updated dependencies [6b64f31]
  - @flatfile/configure@0.5.33.
  - @flatfile/listener@0.3.8.

## 6.1.1

#### 2023-06-14

### Patch Changes

- 268c8d9: Downgrade plugin-record-hook version.

## 6.1.0

#### 2023-06-14

### Minor Changes

- b1637a1: Bump dependency versions to support using recordHooks.

## 6.0.4

#### 2023-06-07

### Patch Changes

- fa2c392: Removing flatfile design system from react package.

## 6.0.3

#### 2023-06-06

### Patch Changes

- Updated dependencies [ce3ff5e]
  - @flatfile/cross-env-config@0.0.4.

## 6.0.2

#### 2023-05-31

### Patch Changes

- Updated dependencies [52fa034]
  - @flatfile/cross-env-config@0.0.3.
  - @flatfile/listener@0.3.3.

## 6.0.1

#### 2023-05-26

### Patch Changes

- 06aa53d: Downgrade react version and update loader.

## 6.0.0

#### 2023-05-19

### Major Changes

- 2a30e13: Add listener to react package.

### Patch Changes

- Updated dependencies [2a30e13]
  - @flatfile/listener@0.3.0.

## 5.0.21

#### 2023-05-19

### Patch Changes

- Updated dependencies [e81e4d4]
  - @flatfile/configure@0.5.30.

## 5.0.20

#### 2023-05-14

### Patch Changes

- Updated dependencies [4807720]
  - @flatfile/configure@0.5.29.

## 5.0.19

#### 2023-05-12

### Patch Changes

- Updated dependencies [46357d9]
  - @flatfile/configure@0.5.28.

## 5.0.18

#### 2023-06-18

### Patch Changes

- Updated dependencies [720394d]
  - @flatfile/configure@0.5.27.

## 5.0.17

#### 2023-06-15

### Patch Changes

- Updated dependencies [74852f3]
  - @flatfile/configure@0.5.26.

## 5.0.16

#### 2023-06-13

### Patch Changes

- Updated dependencies [668bd41]
  - @flatfile/configure@0.5.25.

## 5.0.15

#### 2023-06-08

### Patch Changes

- Updated dependencies [4039970]
  - @flatfile/configure@0.5.24.

## 5.0.14

#### 2023-04-21

### Patch Changes

- Updated dependencies [d8470d8]
  - @flatfile/configure@0.5.23.

## 5.0.13

#### 2023-04-17

### Patch Changes

- 55f9fff: Update API version and use configless space creation in listener example.
- Updated dependencies [55f9fff]
  - @flatfile/configure@0.5.22.

## 5.0.12

#### 2023-04-04

### Patch Changes

- Updated dependencies [d5a587e]
  - @flatfile/configure@0.5.21.

## 5.0.11

#### 2023-04-04

### Patch Changes

- 8ed4e8c: Bumps API version and adds support for record metadata to @flatfile/hooks.
- Updated dependencies [8ed4e8c]
  - @flatfile/configure@0.5.20.

## 5.0.10

#### 2023-03-23

### Patch Changes

- 1c2157f: Add support for naming a space and passing additional space info.

## 5.0.9

#### 2023-03-22

### Patch Changes

- Updated dependencies [c946831]
  - @flatfile/configure@0.5.19.

## 5.0.8

#### 2023-03-21

### Patch Changes

- Updated dependencies [2a0b010]
  - @flatfile/configure@0.5.18.

## 5.0.7

#### 2023-03-17

### Patch Changes

- Updated dependencies [c3ecef6]
  - @flatfile/configure@0.5.17.

## 5.0.6

#### 2023-03-14

### Patch Changes

- 2e25be3: Update packages with updated @flatfile/api.
- Updated dependencies [2e25be3]
  - @flatfile/configure@0.5.16.

## 5.0.5

#### 2023-03-02

### Patch Changes

- 0b4c235: Update makeTheme helper function, add support for documents and spaceConfigId.

## 5.0.4

#### 2023-02-28

### Patch Changes

- a30b3e6: Export useThemeGenerator hook.

## 5.0.3

#### 2023-02-28

### Patch Changes

- 1a6f8e4: Package bundling updates

## 5.0.2

#### 2023-02-28

### Patch Changes

- a886180: Add readme.

## 5.0.1

#### 2023-02-28

### Patch Changes

- 87431f7: Make package public.

## 5.0.0

#### 2023-02-28

### Major Changes

- cf8f7de: Initial beta release for embed react.
