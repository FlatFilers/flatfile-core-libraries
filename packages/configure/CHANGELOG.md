# @flatfile/configure

## 1.0.2

### Patch Changes

- e8bc980: Speed up our build tooling!

## 1.0.1

### Patch Changes

- 5aafdc4: Updated SheetJS dependency to resolve a security issue.

## 1.0.0

### Major Changes

- 72a665b: use commit:created for record hooks

## 0.5.39

### Patch Changes

- 768e022: Add Settings to Workbook

## 0.5.38

### Patch Changes

- b0a6b63: Update dependencies

## 0.5.37

### Patch Changes

- 1db5dc7: Add pagination ability ot @flatfile/configure event

## 0.5.36

### Patch Changes

- 5234a66: Update XLSX dependency

## 0.5.35

### Patch Changes

- 77b6c3a: fixes test helper builder

## 0.5.34

### Patch Changes

- 1575f8c: Make legacy hooks use the dataUrl for updates

## 0.5.33

### Patch Changes

- 6b64f31: adding readme files
- Updated dependencies [6b64f31]
  - @flatfile/hooks@1.3.1

## 0.5.32

### Patch Changes

- 3661315: Add blueprint to field in toSchemaIL()

## 0.5.31

### Patch Changes

- 43c354d: update blueprint types
- Updated dependencies [43c354d]
  - @flatfile/schema@0.2.16

## 0.5.30

### Patch Changes

- e81e4d4: Remove RecordHook

## 0.5.29

### Patch Changes

- 4807720: removes unused node dependencies

## 0.5.28

### Patch Changes

- 46357d9: flatfile deploy and develop

## 0.5.27

### Patch Changes

- 720394d: Fixes async hooks

## 0.5.26

### Patch Changes

- 74852f3: Adds Event Cache

## 0.5.25

### Patch Changes

- 668bd41: use replace instead of replaceAll for older versions of node

## 0.5.24

### Patch Changes

- 4039970: Adds 'x-disable-hooks': 'true' to event payload to x

## 0.5.23

### Patch Changes

- d8470d8: Fix to NumberField so it accepts numbers with mulitple commas.

## 0.5.22

### Patch Changes

- 55f9fff: Update API version and use configless space creation in listener example.
- Updated dependencies [55f9fff]
  - @flatfile/schema@0.2.15

## 0.5.21

### Patch Changes

- d5a587e: Add support for record metadata to configure.

## 0.5.20

### Patch Changes

- 8ed4e8c: Bumps API version and adds support for record metadata to @flatfile/hooks.
- Updated dependencies [8ed4e8c]
  - @flatfile/schema@0.2.14
  - @flatfile/hooks@1.2.4

## 0.5.19

### Patch Changes

- c946831: Updates to use the dataUrl for getting records

## 0.5.18

### Patch Changes

- 2a0b010: Update @flatfile/api

## 0.5.17

### Patch Changes

- c3ecef6: Improve error messaging and allow bypassing data loss check.

## 0.5.16

### Patch Changes

- 2e25be3: Update packages with updated @flatfile/api
- 2e25be3: Adds readonly to Sheet and Field
- Updated dependencies [2e25be3]
  - @flatfile/schema@0.2.13

## 0.5.15

### Patch Changes

- 4b918a2: Adds the new @flatfile/listener package
- 53a2990: Add labels to Workbooks

## 0.5.14

### Patch Changes

- 5e71a27: Adds field existence check to SheetTester.transformField

## 0.5.13

### Patch Changes

- feaf82f: Use specific versions of @flatfile/ packages to make sure everything is in sync.

## 0.5.12

### Patch Changes

- 94f1993: Remove Default XLSX Parsing
- f60ac67: Registers Sheet actions by key instead of name
- cf3bd5f: Update @flatfile/api version
- Updated dependencies [cf3bd5f]
  - @flatfile/schema@0.2.12

## 0.5.11

### Patch Changes

- 882b2aa: Move SheetTester into this repo, and add tests for non-existent fields.

## 0.5.10

### Patch Changes

- ff3f695: Adds a default egress format to DateField

## 0.5.9

### Patch Changes

- 9b43838: Hotfix to not try to include xlsx package in Mono deploys

## 0.5.8

### Patch Changes

- e9830a4: Fixes bug in event.data() function
- 93ff348: Adds value param to OptionField for overriding type directly
- Updated dependencies [93ff348]
  - @flatfile/schema@0.2.11

## 0.5.7

### Patch Changes

- 2e82812: Move XLSX file Processing to Agent code
- Updated dependencies [e0cf5dc]
  - @flatfile/schema@0.2.10

## 0.5.6

### Patch Changes

- 8a2463f: Adds support for stageVisibility:{ mapping:false } to XDK
- 69dd081: Adds Actions to Sheet
- Updated dependencies [8a2463f]
- Updated dependencies [8a2463f]
- Updated dependencies [69dd081]
  - @flatfile/schema@0.2.9
  - @flatfile/hooks@1.2.3

## 0.5.5

### Patch Changes

- fa1694c: Adds getLinks() to Flatfile Record to include linked record values in Hook code
- Updated dependencies [fa1694c]
  - @flatfile/hooks@1.2.2

## 0.5.4

### Patch Changes

- 55eb325: fix an issue where an event listener would not properly close after processing all events

## 0.5.3

### Patch Changes

- d91ad36: Adds ReferenceField to create reference field types in X
- d91ad36: Adds LinkedField support for XDK Deployments
- Updated dependencies [d91ad36]
- Updated dependencies [d91ad36]
  - @flatfile/schema@0.2.7

## 0.5.2

### Patch Changes

- a89ffe4: Removes verifyEgressCycle from record-compute functions

## 0.5.1

### Patch Changes

- 49dc29e: Gives X deployment objects the practical overrides for names and slugs

## 0.5.0

### Minor Changes

- 8d642d4: adds makeField to enable well typed extended fields

### Patch Changes

- Updated dependencies [8d642d4]
  - @flatfile/schema@0.2.6

## 0.4.10

### Patch Changes

- 48a118c: Cleanup

## 0.4.9

### Patch Changes

- e258f27: Adds ability to export SchemaIL Model to Blueprint SheetConfig
- 745a73e: XDK publishing
- Updated dependencies [e258f27]
- Updated dependencies [745a73e]
  - @flatfile/schema@0.2.4
  - @flatfile/hooks@1.2.1

## 0.4.8

### Patch Changes

- dc57b64: feat: improvements to egressFormat, specifically that allow true date comparisons in verify egressCycle

## 0.4.7

### Patch Changes

- ad818ee: feat: initial implementation of GroupByField, and sheetCompute infrastructure on top of sheet
- Updated dependencies [ad818ee]
  - @flatfile/schema@0.2.3

## 0.4.6

### Patch Changes

- 692d4c7: Resolving an issue where required fields ended up with multiple errors

## 0.4.5

### Patch Changes

- f10d51a: feat: adds egressFormat hook to control final to text conversion of a field in an explicit step

## 0.4.4

### Patch Changes

- 6776dde: chore: throw a clear error message when a LinkedField is used without a sheet specified

## 0.4.3

### Patch Changes

- fad3d6e: feat: add CompositeField feature which enables ddl handling of multiple fields in one reusable component

## 0.4.2

### Patch Changes

- 1d0e3d9: Adding matchStrategy to enum to allow exact only matches. and upsert:false to LinkedField to better control upsert behavior
- Updated dependencies [1d0e3d9]
  - @flatfile/schema@0.2.2

## 0.4.1

### Patch Changes

- f47369c: Fixes allowCustomFields feature from the platform-sdk
- Updated dependencies [f47369c]
  - @flatfile/schema@0.2.1

## 0.4.0

### Minor Changes

- 66c193c: Adds Annotations

### Patch Changes

- Updated dependencies [66c193c]
  - @flatfile/schema@0.2.0

## 0.3.6

### Patch Changes

- 5daab1b: Adjust Validate Hook messages to set Info level messages instead of Error
- f77b422: Adds Logger and Session to recordCompute() functions
- 0bb3cbc: Add Portal Deploys via SDK
- Updated dependencies [0d047e6]
  - @flatfile/schema@0.1.4

## 0.3.5

### Patch Changes

- 672a52e: Bugfixes around validate and defaults on OptionField

## 0.3.4

### Patch Changes

- 59cdb30: Bump @flatfile/schema version

## 0.3.3

### Patch Changes

- 9df81f1: Added DateField and batchRecordsCompute

## 0.3.2

### Patch Changes

- ed38f4f: Refactor internals and add CategoryField

## 0.3.1

### Patch Changes

- 7684411: fix: declaring label and options on a field
- Updated dependencies [7684411]
  - @flatfile/schema@0.1.1

## 0.3.0

### Minor Changes

- 744bc73: Make field hooks synchronous

## 0.2.0

### Minor Changes

- efe44a0: @paddymulrenamed hooks onCast -> cast, onEmpty -> empty, onValue -> compute, o…6ec5414…nValidate -> validate

## 0.1.1

### Patch Changes

- 1ba90f5: Fix: Adds labels back in to Fields when exporting from SchemaIL

## 0.1.0

### Minor Changes

- 5819944: Alpha base functionality

### Patch Changes

- Updated dependencies [5819944]
  - @flatfile/orm@0.1.0
  - @flatfile/schema@0.1.0
