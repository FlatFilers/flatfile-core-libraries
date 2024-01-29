# @flatfile/v2-shims

This package is designed to help Flatfile Portal 2 customers upgrade quicker to the new Platform version. You can leverage this package to quickly convert your current setup to a Platform setup. To learn more about the new concepts and what's happening behind the scenes, you can go to the [Platform documentation](https://flatfile.com/docs/upgrade/v2_upgrade).

## Convert Your Config

In Portal 2, the configuration was where everything got started. This contained your Flatfile settings and fields. The `configToBlueprint` method takes in your old configuration and will create a [Platform Blueprint](https://flatfile.com/docs/blueprint/overview) for it.

When we talk about your Flatfile config for Portal 2, we are talking about the Object that gets passed in as the 2nd parameter of the `FlatfileImporter` Class.

```js Portal 2 Config
const importer = new FlatfileImporter(
  'License_Key',
  {} // This is your config Object
)
```

Below you can see some simple usage snippets of how this will look when converting:

```js The Portal 2 Config
import FlatfileImporter from '@flatfile/adapter'

const importer = new FlatfileImporter('License_Key', {
  type: 'Contacts',
  fields: [
    {
      key: 'name',
      label: 'Name',
      description: 'Contact name',
      validators: [{ validate: 'required' }],
    },
  ],
})
```

```js Platform - configToBlueprint
import { configToBlueprint } from '@flatfile/v2-shims'
import { configureSpace } from '@flatfile/plugin-space-configure'

const v2config = {
  type: 'Contacts',
  fields: [
    {
      key: 'name',
      label: 'Name',
      description: 'Contact name',
      validators: [{ validate: 'required' }],
    },
  ],
}

const blueprint = configToBlueprint(v2config)

export default function (listener) {
  listener.use(configureSpace({ workbooks: [blueprint] }))
}
```

## Convert Your Data Hooks

The `validators` function implements v2 validator shims on any migrated schema. It is designed to be used as a middleware for Flatfile Platform integration. The function takes a `sheetSlug` as input and returns a function that can be used as a [Listener](https://flatfile.com/docs/quickstart/meet-the-listener) with Flatfile.

```js Usage
import { validators } from '@flatfile/v2-shims';

// Define the sheetSlug for the schema you want to apply validators to
const sheetSlug = 'your-sheet-slug';

// Create a FlatfileListener instance
const flatfileListener = ...; // Initialize your FlatfileListener

// Use the validators function to attach validator shims to the listener
flatfileListener.use(validators(sheetSlug));

```

## Handle Data Egress

This function is a plugin designed to handle data from Flatfile. It's used with a Flatfile Listener and is intended for processing data after a submission action in your Flatfile integration. It takes a handler function as input, which is responsible for processing the data and returns a Listener that can be used with Flatfile.

```js Example
import { handleData } from '@flatfile/v2-shims'

// Define your data handling logic in the handler function
const handler = (results) => {
  // Example data handling logic
  console.log('Received Flatfile Results:')
  console.log(results)
}

// Initialize a FlatfileListener (assuming you have the necessary setup)
const flatfileListener = Flatfile.listener({
  // Configure your Flatfile settings here
  apiKey: 'your-api-key',
  // ...
})

// Use the handleData function to attach data handling functionality to the listener
flatfileListener.use(handleData(handler))

// Define event handling logic (e.g., on job:ready event) as needed
flatfileListener.on('job:ready', (event) => {
  // Handle the job:ready event
})
```
