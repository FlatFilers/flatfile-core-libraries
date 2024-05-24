
### February 29, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.8.7

        This release includes a fix to ensure that only defined parameters are included in the space creation request. When creating a new space using the initializeSpace utility, optional parameters like namespace, translationsPath, and languageOverride will only be included in the request if they are provided. This change helps prevent potential issues caused by including undefined values in the request. For example:

```jsx
const space = await initializeSpace({
  licenseKey: 'your_license_key',
  name: 'My Space',
  namespace: 'my-namespace', // This will be included
  // translationsPath and languageOverride are omitted, so they won't be included
});
```

This improvement enhances the robustness and reliability of the space creation process, ensuring that your application only sends the necessary data to Flatfile's API. Upgrade to take advantage of this bug fix and enjoy a smoother data import experience powered by Flatfile!
        </div>
  </div>

</div>
