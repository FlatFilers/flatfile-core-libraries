
### May 22, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.9.7

        In this release, the @flatfile/react package has received improvements focused on better typing and organization. The key changes are:

The typing for several components and utilities has been improved for better type safety. Notable examples include the FlatfileContext, usePlugin hook, and createSpaceInternal utility. The code has been refactored to enhance organization and readability, including converting some components to arrow function components. 

Additionally, the ConfirmCloseModal component has been exported directly instead of being a default export, making its usage more explicit. The EmbeddedIFrameWrapper component now includes a title attribute for better accessibility.

Some internal utility types like ClosePortalOptions and CREATE_SPACE_INTERNAL have been extracted into separate files for better code organization. The package has also updated its dependency on @flatfile/embedded-utils to the latest version 1.2.4.

Overall, this release focuses on improving the developer experience by enhancing type safety, code organization, and maintainability within the @flatfile/react package.
        </div>
  </div>

</div>
