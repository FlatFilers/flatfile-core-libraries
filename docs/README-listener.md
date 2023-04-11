---
stoplight-id: nm4gl37l29x65
---

# [@flatfile/listener](https://www.npmjs.com/package/@flatfile/listener)

The Flatfile **PubSub Client** is a super thin wrapper around the Flatfile API. It allows you to call our API after receiving events from any PubSub driver. 

**The default drivers are:**

- Webhook    (for simply processing events sent to URL)
- Websocket  (for subscribing real time on an HTTP2 connection)
- Serverless (for stateless invocations via AWS Lambda or similar)

Once an event is received, it is routed to any awaiting listeners which are added with `addEventListener()` or its alias `on()`.

Flatfile events follow a standard structure and event listeners can use any of the following syntaxes to react to events within Flatfile.

### Before you begin

The minimum supported version of Node.js is v18. If you use an older version, upgrade to use this library. 

Check your versions in terminal:

```npm
node --version
```

#### Concepts

Take a moment to learn event-related Flatfile architecture. This will help orient yourself before you begin building.

```mermaid
flowchart TD
    subgraph Data Lifecycle
      subgraph Agents
        Events
      end
      Jobs:::someclass
    classDef someclass fill:#f96
    end
    Space-->Jobs
    Environment-->Space
    Environment-->subscriptionToken
    Environment-->Agents:::someclass
    classDef someclass fill:#f96
    Environment-->Events:::someclass
    classDef someclass fill:#f96
```

An **Agent** is a “coordinator” that watches for events it cares about and then says “ok now perform this work”.

A **Job** is a batch of work that you schedule to be completed asynchronously. Processing data asynchronously is necessary when the data is too big to wait around for the API to come back with a response.

An **Event** is a moment in time in a stream of events that happen in Flatfile.

An **Event context** is the specific scope within an event, we may not want to respond to events that happen globally under our account (because ultimately that would be too noisy!) we may just want to listen to events within a workbook or a single sheet.

#### Setup

Install Listener from the npm public registry.

```npm
npm install @flatfile/listener@latest
```
```yarn
yarn install @flatfile/listener@latest
```

#### Usage

Using our powerful [@flatfile/listener](https://www.npmjs.com/package/@flatfile/listener) library we can intervene between any event and run a callback function based on values provided inside that event.

```typescript

declare const EventTopic: {
   readonly Spaceadded: "space:added";
   readonly Spaceremoved: "space:removed";
   readonly Workbookadded: "workbook:added";
   readonly Workbookremoved: "workbook:removed";
   readonly Useradded: "user:added";
   readonly Userremoved: "user:removed";
   readonly Useronline: "user:online";
   readonly Useroffline: "user:offline";
   readonly Uploadstarted: "upload:started";
   readonly Uploadfailed: "upload:failed";
   readonly Uploadcompleted: "upload:completed";
   readonly Jobstarted: "job:started";
   readonly Jobwaiting: "job:waiting";
   readonly Jobupdated: "job:updated";
   readonly Jobfailed: "job:failed";
   readonly Jobcompleted: "job:completed";
   readonly Jobdeleted: "job:deleted";
   readonly Recordscreated: "records:created";
   readonly Recordsupdated: "records:updated";
   readonly Recordsdeleted: "records:deleted";
   readonly Sheetvalidated: "sheet:validated";
   readonly Filedeleted: "file:deleted";
   readonly Actiontriggered: "action:triggered";
   readonly Clientinit: "client:init";
}

```

An event context is passed to an **EventFilter**

```typescript
export type EventFilter = Record<string, Arrayable<string>>

// example event context

{ context: { sheetSlug: 'TestSheet' } }

```

### Examples

#### Splitting fields

In this example, we listen for an **action** named `split-field` to be triggered on the `TestSheet` and respond by taking the value that exists in the `full_name` field and splitting it into two separate fields `first_name` and `last_name`.

We then call the `updateRecords` endpoint to push the split data.

<!--
type: tab
title: Listener
-->

```typescript

import { Client } from '@flatfile/listener'

export const splitFieldClient = Client.create((client) => {
  client.on(
    'action:triggered',
    // @ts-ignore
    { context: { actionName: 'TestSheet:split-field' } },
    async (event) => {
      const { sheetId, versionId } = event.context

      try {
        const {
          data: { records }
        } = await event.api.getRecords({
          sheetId,
          versionId
        })

        console.log({ records })

        const recordsUpdates = records?.map((record: any) => {
          const fullName = record.values['full_name'].value
          const splitName = fullName.split(' ')

          record.values['first_name'].value = splitName[0]
          record.values['last_name'].value = splitName[1]

          return record
        })

        console.log({ recordsUpdates })

        await event.api.updateRecords({
          sheetId,
          recordsUpdates
        })
      } catch (e) {
        console.log(
          `Error updating records - Use console logs inside your events to further debug: ${e}`
        )
      }
    }
  )
})


```

<!--
type: tab
title: Configuration
-->

```typescript

import { Blueprint } from '@flatfile/api'

export const config: {
  slug: string
  name: string
  blueprints: Blueprint[]
} = {
  slug: 'split-field-config',
  name: 'Editable Name',
  blueprints: [
    {
      slug: 'basic-config-local',
      name: 'Split field blueprint',
      sheets: [
        {
          name: 'TestSheet',
          slug: 'TestSheet',
          fields: [
            {
              key: 'first_name',
              type: 'string',
              label: 'First name',
              constraints: [
                {
                  type: 'required'
                }
              ]
            },
            {
              key: 'last_name',
              type: 'string',
              label: 'last name',
              constraints: [
                {
                  type: 'required'
                }
              ]
            },
            {
              key: 'full_name',
              type: 'string',
              label: 'full name'
            }
          ],
          actions: [
            {
              slug: 'split-field',
              label: 'Split field'
            }
          ]
        }
      ]
    }
  ]
}

```

<!-- type: tab-end -->

#### Joining fields

In this example, we listen for an **action** named `join-field` to be triggered on the `TestSheet` and respond by taking the value that exists in the `first_name` and `last_name` field and adding it to a new field named `full_name`.

We then call the `updateRecords` endpoint to push the merged data.

<!--
type: tab
title: Listener
-->

```typescript

import { Client } from '@flatfile/listener'
import { RecordsUpdates } from '@flatfile/api'

export const joinFieldClient = Client.create((client) => {
  client.on(
    'action:triggered',
    // @ts-ignore
    { context: { actionName: 'TestSheet:join-field' } },
    async (event) => {
      const { sheetId, versionId } = event.context
      // get records

      try {
        const {
          data: { records }
        } = await event.api.getRecords({
          sheetId,
          versionId
        })

        if (!records) return

        // Populate full name field

        const recordsUpdates = records?.map((record: any) => {
          const fullName =
            record.values['first_name'].value + record.values['last_name'].value

          record.values['full_name'].value = fullName

          return record
        })

        console.log('updates', { recordsUpdates })

        await event.api.updateRecords({
          sheetId,
          recordsUpdates: recordsUpdates as RecordsUpdates
        })
      } catch (e) {
        console.log(
          `Error updating records - Use console logs inside your events to further debug: ${e}`
        )
      }
    }
  )
})

```

<!--
type: tab
title: Configuration
-->

```typescript

import { Blueprint } from '@flatfile/api'

export const config: {
  slug: string
  name: string
  blueprints: Blueprint[]
} = {
  slug: 'join-field-config',
  name: 'Editable Name',
  blueprints: [
    {
      slug: 'basic-config-local',
      name: 'Join field blueprint',
      sheets: [
        {
          name: 'TestSheet',
          slug: 'TestSheet',
          fields: [
            {
              key: 'first_name',
              type: 'string',
              label: 'First name',
              constraints: [
                {
                  type: 'required'
                }
              ]
            },
            {
              key: 'last_name',
              type: 'string',
              label: 'last name',
              constraints: [
                {
                  type: 'required'
                }
              ]
            },
            {
              key: 'full_name',
              type: 'string',
              label: 'full name'
            }
          ],
          actions: [
            {
              slug: 'join-field',
              label: 'Join field'
            }
          ]
        }
      ]
    }
  ]
}

```

<!-- type: tab-end -->

#### Cross-field validation

In this example, when records are updated or created `(records:*)`, we do cross-field validation by checking if the field value named `salary` is less than 50, then updating the `needs_raise` value to true and setting `needs_raise` to false if `salary` is greater than 50.

We then call the `updateRecords` endpoint to push the merged data.

<!--
type: tab
title: Listener
-->

```typescript title="Checks values across fields and populates based on that check"

export const crossfieldClient = Client.create((client) => {
  client.on(
    'records:*',
    // @ts-ignore
    { context: { sheetSlug: 'TestSheet' } },
    async (event) => {
      const { sheetId, versionId } = event.context

      try {
        const {
          data: { records }
        } = await event.api.getRecords({
          sheetId,
          versionId
        })

        console.log({ records })

        const recordsUpdates = records?.map((record: any) => {
          if (record.values.salary.value < 50) {
            record.values['needs_raise'].value = true
          } else {
            record.values['needs_raise'].value = false
          }

          return record
        })

        console.log({ recordsUpdates })

        await event.api.updateRecords({
          sheetId,
          recordsUpdates
        })
      } catch (e) {
        console.log(
          `Error updating records - Use console logs inside your events to further debug: ${e}`
        )
      }
    }
  )
})

```

<!--
type: tab
title: Configuration
-->

```typescript title="Checks values across fields and populates based on that check"

import { Blueprint } from '@flatfile/api'
import { Client } from '@flatfile/listener'

export const config: {
  slug: string
  name: string
  blueprints: Blueprint[]
} = {
  slug: 'cross-field-config',
  name: 'Editable Name',
  blueprints: [
    {
      slug: 'basic-config-local',
      name: 'Cross field blueprint',
      sheets: [
        {
          name: 'TestSheet',
          slug: 'TestSheet',
          fields: [
            {
              key: 'salary',
              type: 'number',
              label: 'salary'
            },
            {
              key: 'needs_raise',
              type: 'boolean',
              label: 'needs raise'
            }
          ]
        }
      ]
    }
  ]
}
```

<!-- type: tab-end -->

#### External API Validation

In this example, when records are updated or created `(records:*)`, we validate the `brewery_name` field value against an external api (<https://api.openbrewerydb.org/breweries?by_city=denver>). If the value in the `brewery_name` field matches ANY names in the brewery API, we set the `brewery_name` value to **Exists in DB**.

We then call the `updateRecords` endpoint to push the merged data.

<!--
type: tab
title: Listener
-->

```typescript title="Checks uploaded data against external api"

import { Client } from '@flatfile/listener'
import { RecordsUpdates } from '@flatfile/api'

export const externalApiClient = Client.create((client) => {
  client.on(
    'records:*',
    // @ts-ignore
    { context: { sheetSlug: 'TestSheet' } },
    async (event) => {
      const { sheetId, versionId } = event.context
      // get records

      try {
        const {
          data: { records }
        } = await event.api.getRecords({
          sheetId,
          versionId
        })

        if (!records) return

        const breweries = await fetch(
          'https://api.openbrewerydb.org/breweries?by_city=denver'
        )
          .then((res) => {
            return res.json()
          })
          .then((data) => {
            return data
          })

        const recordsUpdates = records?.map((record: any) => {
          const breweryNameRecordValue = record.values['brewery-name'].value
          const matchingBrewery = breweries.find((brewery) => {
            return brewery.name === breweryNameRecordValue
          })
          if (matchingBrewery) {
            record.values['brewery-name'].value = 'Exists in DB'
          }

          return record
        })

        console.log('updates', { recordsUpdates })

        await event.api.updateRecords({
          sheetId,
          recordsUpdates: recordsUpdates as RecordsUpdates
        })
      } catch (e) {
        console.log(
          `Error updating records - Use console logs inside your events to further debug: ${e}`
        )
      }
    }
  )
})


```

<!--
type: tab
title: Configuration
-->

```typescript

import { Blueprint } from '@flatfile/api'

export const config: {
  slug: string
  name: string
  blueprints: Blueprint[]
} = {
  slug: 'external-api-config',
  name: 'Editable Name',
  blueprints: [
    {
      slug: 'basic-config-local',
      name: 'external-api-blueprint',
      sheets: [
        {
          name: 'TestSheet',
          slug: 'TestSheet',
          fields: [
            {
              key: 'brewery-name',
              type: 'string',
              label: 'Brewery name'
            }
          ]
        }
      ]
    }
  ]
}

```

<!-- type: tab-end -->

#### NPM Packages

In this example, when records are updated or created `(records:*)`, we convert the value in the `color` field to the matching HEX color using the npm package [Color](https://www.npmjs.com/package/color) If the value has a matching hex, we update the value in the `color` field to that hex value.

We then call the `updateRecords` endpoint to push the merged data.

<!--
type: tab
title: Listener
-->

```typescript title="Gets hex value of color-string"

import { Client } from '@flatfile/listener'
import { RecordsUpdates } from '@flatfile/api'
import Color from 'color'

export const npmPackageClient = Client.create((client) => {
  client.on(
    'records:*',
    // @ts-ignore
    { context: { sheetSlug: 'TestSheet' } },
    async (event) => {
      const { sheetId, versionId } = event.context
      // get records

      try {
        const {
          data: { records }
        } = await event.api.getRecords({
          sheetId,
          versionId
        })

        if (!records) return

        const recordsUpdates = records?.map((record: any) => {
          const newColor = Color(record.values.color.value).hex()
          record.values.color.value = newColor

          return record
        })

        console.log('updates', { recordsUpdates })

        await event.api.updateRecords({
          sheetId,
          recordsUpdates: recordsUpdates as RecordsUpdates
        })
      } catch (e) {
        console.log(
          `Error updating records - Use console logs inside your events to further debug: ${e}`
        )
      }
    }
  )
})


```

<!--
type: tab
title: Configuration
-->

```typescript

import { Blueprint } from '@flatfile/api'

export const config: {
  slug: string
  name: string
  blueprints: Blueprint[]
} = {
  slug: 'npm-package-config',
  name: 'Editable Name',
  blueprints: [
    {
      slug: 'basic-config-local',
      name: 'npm package blueprint',
      sheets: [
        {
          name: 'TestSheet',
          slug: 'TestSheet',
          fields: [
            {
              key: 'color',
              type: 'string',
              label: 'Color'
            }
          ]
        }
      ]
    }
  ]
}

```

<!-- type: tab-end -->

#### RegEx Validation

In this example, when records are updated or created `(records:*)`, we check that the `email` field value contains an `@` sign and if it does not, we set an error message on the record of `value must contain an @`.

We then call the `updateRecords` endpoint to push the merged data.

<!--
type: tab
title: Listener
-->

```typescript title="Validates emails"

import { Client } from '@flatfile/listener'
import { RecordsUpdates } from '@flatfile/api'

export const regExClient = Client.create((client) => {
  client.on(
    'records:*',
    // @ts-ignore
    { context: { sheetSlug: 'TestSheet' } },
    async (event) => {
      const { sheetId, versionId } = event.context

      try {
        const {
          data: { records }
        } = await event.api.getRecords({
          sheetId,
          versionId
        })

        const regex = new RegExp('^S+@S+$')

        if (!records) return

        const recordsUpdates = records?.map((record: any) => {
          const isValid = regex.test(record.values.email.value)
          const messages = record.values.email.messages

          if (!isValid) {
            record.values.email.messages = [
              ...messages,
              {
                message: 'value must contain an @',
                type: 'error',
                source: 'custom-logic'
              }
            ]
          }

          return record
        })

        console.log('updates', { recordsUpdates })

        await event.api.updateRecords({
          sheetId,
          recordsUpdates: recordsUpdates as RecordsUpdates
        })
      } catch (e) {
        console.log(
          `Error updating records - Use console logs inside your events to further debug: ${e}`
        )
      }
    }
  )
})


```

<!--
type: tab
title: Configuration
-->

```typescript

import { Blueprint } from '@flatfile/api'

export const config: {
  slug: string
  name: string
  blueprints: Blueprint[]
} = {
  slug: 'regex-config',
  name: 'Editable Name',
  blueprints: [
    {
      slug: 'basic-config-local',
      name: 'regex blueprint',
      sheets: [
        {
          name: 'TestSheet',
          slug: 'TestSheet',
          fields: [
            {
              key: 'email',
              type: 'string',
              label: 'email'
            }
          ]
        }
      ]
    }
  ]
}

```

<!-- type: tab-end -->


### Debugging

<!-- theme: warning -->

> #### Not seeing your hooks / actions / events fire? Check the following:
>
> - Any network request errors?
> - Does your event exist inside [EventTopic](href=#what-is-a-flatfile-event)?
> - Does your event that you are listening for match the one that is being logged?
> - Does your context value match what is being console logged?
> - Are populated values coming back for records?
> - Does your action name match the name you passed inside your config?
