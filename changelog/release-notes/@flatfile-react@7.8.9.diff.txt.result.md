
### March 15, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.8.9

        In this new release of the @flatfile/react package, the environmentId parameter is now optional when initializing a new Flatfile space. This change provides more flexibility for developers who may not need to specify an environmentId. Additionally, there was an update to a dependency, @flatfile/embedded-utils, which was bumped to version 1.1.12. 

To utilize the optional environmentId, developers can now create a Flatfile space without providing the environmentId parameter, like so:

```js
const space = await limitedAccessApi.spaces.create({
  name: 'your-space-name',
  autoConfigure: true,
  // No need to provide environmentId
});
```

This exciting update streamlines the integration process, making it even easier for developers to incorporate Flatfile's powerful data import capabilities into their applications. Don't miss out on this convenient enhancement!
        </div>
  </div>

</div>
