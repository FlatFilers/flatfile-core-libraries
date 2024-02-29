# flatfile

## 3.6.2

### Patch Changes

- 5110854: Only prompt for validation if topics are passed in by the user

## 3.6.1

### Patch Changes

- c33d934: `flatfile develop` does not need confirmation if there are no deployed agents

## 3.6.0

### Minor Changes

- 7b8ae50: Adds the ability to list, delete and deploy agents with slugs

## 3.5.15

### Patch Changes

- 22c4837: Update to use the latest @flatfile/api version 1.7.1

## 3.5.14

#### 2024-02-07

### Patch Changes

- 8d62a74: Add in more event topics for deployed agents
- Updated dependencies [56388f0]
  - @flatfile/listener@1.0.0
  - @flatfile/listener-driver-pubsub@2.0.3

## 3.5.13

#### 2024-01-09

### Patch Changes

- Updated dependencies [1eedc59]
  - @flatfile/listener@0.4.0
  - @flatfile/listener-driver-pubsub@2.0.0

## 3.5.12

#### 2023-12-01

### Patch Changes

- a2c7953: Update Link to API Key article

## 3.5.11

#### 2023-10-11

### Patch Changes

- 1fc04c4: Update Dependencies

## 3.5.10

#### 2023-09-22

### Patch Changes

- bf44352: Update path sep to posix

## 3.5.9

#### 2023-09-12

### Patch Changes

- 3436070: Updates error handling messages

## 3.5.8

#### 2023-07-19

### Patch Changes

- f191fb6: Update CLI dependency

## 3.5.7

#### 2023-07-17

### Patch Changes

- cbacf2a: Update semver version > 7.5.2
  resolves https://security.snyk.io/vuln/SNYK-JS-SEMVER-3247795
- Updated dependencies [cbacf2a]
  - @flatfile/cross-env-config@0.0.5
  - @flatfile/listener@0.3.11
  - @flatfile/listener-driver-pubsub@1.0.3

## 3.5.6

#### 2023-06-28

### Patch Changes

- ceb5351: Check for deployed agents before developing
- Updated dependencies [ad5cf83]
- Updated dependencies [ce3386c]
  - @flatfile/listener@0.3.10

## 3.5.5

#### 2023-06-26

### Patch Changes

- 3b3c69f: Updates error messages when fetching environments in cli actions

## 3.5.4

#### 2023-06-23

### Patch Changes

- d26f2d1: Check for deployed agents before developing

## 3.5.3

#### 2023-06-16

### Patch Changes

- 614b8c5: Update version of listener
- Updated dependencies [614b8c5]
  - @flatfile/listener-driver-pubsub@1.0.2

## 3.5.2

#### 2023-06-16

### Patch Changes

- e8eff5c: Update to latest version of listener
- Updated dependencies [e8eff5c]
  - @flatfile/listener@0.3.9

## 3.5.1

#### 2023-06-15

### Patch Changes

- 6b64f31: adding readme files
- Updated dependencies [6b64f31]
  - @flatfile/listener@0.3.8

## 3.5.0

#### 2023-06-14

### Minor Changes

- a3f3314: Update listener

## 3.4.11

#### 2023-06-13

### Patch Changes

- f227290: This version introduces some significant improvements to the capabilities of npx flatfile develop. All outgoing HTTP requests are logged in the debug stream, and we now have a much cleaner analysis of events that are received and where/how they are processed.
- Updated dependencies [f227290]
  - @flatfile/listener-driver-pubsub@1.0.1

## 3.4.10

#### 2023-06-06

### Patch Changes

- Updated dependencies [ce3ff5e]
  - @flatfile/cross-env-config@0.0.4

## 3.4.9

#### 2023-06-01

### Patch Changes

- 0a52861: bugfix of included templates

## 3.4.8

#### 2023-05-31

### Patch Changes

- 841c32d: Fix bug to allow setting api url via .env file

## 3.4.7

#### 2023-05-31

### Patch Changes

- 52fa034: cleans up dist
- Updated dependencies [52fa034]
  - @flatfile/cross-env-config@0.0.3

## 3.4.6

#### 2023-05-26

### Patch Changes

- f8fe0cc: Update @flatfile/api version

## 3.4.5

#### 2023-05-26

### Patch Changes

- 90a1f9a: Allow more than 10 environments

## 3.4.4

#### 2023-05-22

### Patch Changes

- 438d908: resolve a bug with event streaming

## 3.4.3

#### 2023-05-21

### Patch Changes

- d23b665: improving error message on entry file

## 3.4.2

#### 2023-05-21

### Patch Changes

- 60a94d7: share file discovery logic

## 3.4.1

#### 2023-05-21

### Patch Changes

- aaaf3cf: subscribe to more events

## 3.4.0

#### 2023-05-19

### Minor Changes

- 637342b: Remove @flatfile/api from listener

## 3.3.8

#### 2023-05-18

### Patch Changes

- 626f896: check for .ts files when running npx flatfile

## 3.3.7

#### 2023-05-17

### Patch Changes

- 9641918: Fix develop command for using node fetch

## 3.3.6

#### 2023-05-12

### Patch Changes

- 46357d9: flatfile deploy and develop

## 3.3.5

#### 2023-05-05

### Patch Changes

- 919c1f1: Adds backwards compatible support for legacy events

## 3.3.4

#### 2023-05-02

### Patch Changes

- 8ea7135: Fix the events being subscribed to on publish

## 3.3.3

#### 2023-04-28

### Patch Changes

- 0cbf01b: Add lower cpu compilation mode FLATFILE_COMPILE_MODE=no-minify

## 3.3.2

#### 2023-04-28

### Patch Changes

- 73cec59: Adding support for any type of entry file

## 3.3.1

#### 2023-04-28

### Patch Changes

- fe4762d: Resolve deployment bug

## 3.3.0

#### 2023-04-28

### Minor Changes

- 640b392: Add flatfile deploy command for platform usecases

## 3.2.3

#### 2023-04-17

### Patch Changes

- 55f9fff: Update API version and use configless space creation in listener example.

## 3.2.2

#### 2023-04-04

### Patch Changes

- 8ed4e8c: Bumps API version and adds support for record metadata to @flatfile/hooks.

## 3.2.1

#### 2023-03-28

### Patch Changes

- a66cacd: Subscribes agent deploys to all events as well

## 3.2.0

#### 2023-03-21

### Minor Changes

- 73b65b8: added all event topics to listener

## 3.1.20

#### 2023-03-14

### Patch Changes

- 2e25be3: Update packages with updated @flatfile/api

## 3.1.19

#### 2023-03-02

### Patch Changes

- 4b918a2: Adds the new @flatfile/listener package
- 53a2990: Add labels to Workbooks

## 3.1.18

#### 2023-02-23

### Patch Changes

- 51ba23e: Adds Env Vars to Agent Code

## 3.1.17

#### 2023-02-13

### Patch Changes

- cf3bd5f: Update @flatfile/api version

## 3.1.16

#### 2023-01-27

### Patch Changes

- 2e82812: Move XLSX file Processing to Agent code

## 3.1.15

#### 2023-01-25

### Patch Changes

- 70df9ce: Add check for git and node

## 3.1.14

#### 2023-01-24

### Patch Changes

- 8a2463f: Adds support for stageVisibility:{ mapping:false } to XDK
- 69dd081: Adds Actions to Sheet

## 3.1.13

#### 2023-01-19

### Patch Changes

- 4724aed: Adds a shortcut for local X deployment with the XDK

## 3.1.12

#### 2023-01-04

### Patch Changes

- d91ad36: Adds ReferenceField to create reference field types in X
- a57c57c: Adds -x flag to CLI Init script to generate a repo ready to deploy to X
- d91ad36: Adds LinkedField support for XDK Deployments

## 3.1.11

#### 2022-12-22

### Patch Changes

- 4a12d2e: Cleanup some cruft

## 3.1.10

#### 2022-12-21

### Patch Changes

- 228063d: Adds a tool to create environments in X
- 49dc29e: Gives X deployment objects the practical overrides for names and slugs

## 3.1.9

#### 2022-12-15

### Patch Changes

- 8ba53bf: Adds a final update deployment mutation

## 3.1.8

#### 2022-12-09

### Patch Changes

- 48a118c: Cleanup

## 3.1.7

#### 2022-12-07

### Patch Changes

- 745a73e: XDK publishing

## 3.1.5

#### 2022-11-18

### Patch Changes

- ad818ee: feat: initial implementation of GroupByField, and sheetCompute infrastructure on top of sheet

## 3.1.4

#### 2022-11-09

### Patch Changes

- ca74bc6: fix: remove errant console log in init command

## 3.1.3

#### 2022-11-02

### Patch Changes

- fb24161: chore: update readme

## 3.1.2

#### 2022-11-01

### Patch Changes

- 635291a: fix bug where values passed in as options to the init command are undefined

## 3.1.1

#### 2022-10-31

### Patch Changes

- af94de4: fix bug where the CLI failed if a package.json file was not present in the root dir

## 3.1.0

#### 2022-10-27

### Minor Changes

- 1792c54: Adds init command and improvements to stack traces during publish

### 3.0.3

#### 2022-10-12

### Patch Changes

- f47369c: Fixes allowCustomFields feature from the platform-sdk

## 3.0.2

#### 2022-09-26

### Patch Changes

- d979841: Made the 'test' env the default option for deploy

## 3.0.1

#### 2022-09-21

### Patch Changes

- 0bb3cbc: Add Portal Deploys via SDK

## 3.0.0

#### 2022-08-25

### Major Changes

- 56a292f: Updated from old package

## 0.2.0

#### Date not provided

### Minor Changes

- 8732a95: Adds passing the environment slug along with deployments and schemas

### Patch Changes

- 4e9f937: organize publish steps, provide summary

## 0.1.0

#### Date not provided

### Minor Changes

- 5819944: Alpha base functionality

## 0.0.3

#### Date not provided

### Patch Changes

- Bundle all externals

## 0.0.2

#### Date not provided

### Patch Changes

- Modify the file param structure
