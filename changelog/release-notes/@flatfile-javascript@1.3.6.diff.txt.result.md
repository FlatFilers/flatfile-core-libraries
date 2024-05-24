
### May 01, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/javascript@1.3.6

        This release includes several improvements and updates to the @flatfile/javascript package. The closeSpace.operation and closeSpace.onClose options are now optional when initializing the iFrame confirmation modal, providing more flexibility. Internal dependencies have been updated, including @flatfile/embedded-utils, @flatfile/listener, and @flatfile/plugin-record-hook. Build tooling has been optimized for faster performance. Additionally, the handlePostMessage function has been refactored, simplifying the event handling logic. The package now targets ES2015 instead of ES6, ensuring broader compatibility. Overall, these changes bring performance enhancements, dependency updates, and improved developer experience when using the Flatfile JavaScript integration.

        Example usage:

        ```javascript
        initializeIFrameConfirmationModal(
          targetEl,
          spacesUrl,
          accessToken,
          apiUrl,
          exitPrimaryButtonText,
          exitSecondaryButtonText,
          {
            operation: 'my-close-operation', 
            onClose: () => {
              // Handle close operation
            }
          }
        )
        ```
        </div>
  </div>

</div>
