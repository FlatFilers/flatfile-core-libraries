
### February 07, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/core.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/listener@1.0.1

        The @flatfile/listener package has received an update to improve its distribution and browser compatibility. The package.json file has been updated to include exports and browser fields, allowing the package to be consumed more easily in both Node.js and browser environments. Additionally, the Rollup configuration has been modified to generate UMD builds, further enhancing cross-environment compatibility. These changes make it easier for developers to integrate the @flatfile/listener package into their applications, regardless of the target runtime environment.

        For example, in a browser environment, the package can now be imported like:

        ```javascript
        import { Listener } from '@flatfile/listener/dist/index.browser.mjs';
        ```

        Or in a Node.js environment:

        ```javascript
        const { Listener } = require('@flatfile/listener');
        ```

        This update streamlines the distribution process and improves the overall developer experience when working with the @flatfile/listener package, making it a more versatile and user-friendly addition to any project.
        </div>
  </div>

</div>
