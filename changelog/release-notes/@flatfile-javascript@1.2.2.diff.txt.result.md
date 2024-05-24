
### February 07, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/javascript@1.2.2

        This release updates the @flatfile/javascript package with several improvements. The package.json file has been updated with exports and browser fields to support different module systems. A typo in the package.json file has also been fixed. Additionally, the @flatfile/listener dependency has been updated to version 1.0.1. These changes make it easier for developers to integrate Flatfile's data import experience into their applications using the preferred module system and ensure compatibility with the latest versions of dependencies. Developers can now seamlessly utilize the updated package with improved module resolution and compatibility.

        For example, the updated exports field in package.json allows developers to import the package using the appropriate module syntax:

        ```javascript
        import FlatfileImporter from '@flatfile/javascript'
        ```

        Overall, this release enhances the developer experience and maintainability of applications using the @flatfile/javascript package.
        </div>
  </div>

</div>
