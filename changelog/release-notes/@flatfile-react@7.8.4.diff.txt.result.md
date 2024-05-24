
### February 26, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.8.4

        This release updates the default space URL used by the @flatfile/react package to https://platform.flatfile.com/s. Previously, it was using https://spaces.flatfile.com. This change helps avoid unnecessary preflight requests.

        For developers using this package, the implication is that data import experiences provided by Flatfile will now be loaded from the new platform.flatfile.com/s domain by default, instead of spaces.flatfile.com. This should improve the performance and reliability of the integration, as preflight requests that were previously required will no longer be necessary.

        To take advantage of this update, no code changes are required for most use cases. However, if you were explicitly setting the spaceUrl prop in your application, you may want to update it to use the new default value of https://platform.flatfile.com/s. For example:

        ```jsx
        <FlatfileImporter spaceUrl="https://platform.flatfile.com/s" {...otherProps} />
        ```

        This exciting update demonstrates Flatfile's commitment to providing a smooth and optimized data import experience for your application's users. Embrace the future of seamless data ingestion with the latest improvements from Flatfile!
        </div>
  </div>

</div>
