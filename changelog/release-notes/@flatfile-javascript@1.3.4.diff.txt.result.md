
### May 01, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/javascript@1.3.4

        The latest version 1.3.4 of the @flatfile/javascript package makes some improvements. The closeSpace.operation and closeSpace.onClose properties are now optional, allowing more flexibility when closing the Flatfile space. Additionally, it updates the @flatfile/embedded-utils dependency to version 1.2.1. This release streamlines the handling of post messages from the Flatfile iframe, simplifying the event listener setup. Developers can now more easily integrate Flatfile's data import functionality while maintaining control over the closing behavior. These changes further enhance the seamless integration of Flatfile into applications, making it even more developer-friendly.

        For example, instead of manually handling post messages, developers can now use the provided handlePostMessage utility:

        ```typescript
        window.addEventListener(
          'message', 
          handlePostMessage(closeSpace, listener),
          false
        )
        ```

        This level of refinement demonstrates Flatfile's commitment to providing a top-notch developer experience for integrating their powerful data import capabilities.
        </div>
  </div>

</div>
