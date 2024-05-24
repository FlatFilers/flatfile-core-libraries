
### February 26, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.8.5

        In this release, the types for the Workbook have been updated to include all available parameters. This change provides a more comprehensive and accurate type definition for developers working with the Workbook component, allowing for better type safety and improved developer experience. Additionally, the @flatfile/embedded-utils dependency has been updated to the latest version, bringing any bug fixes or improvements from that package. Upgrade to this version to take advantage of the enhanced type definitions and ensure you are using the latest dependencies.

        For example, when working with the Workbook component, you can now access and provide values for all available properties using type-safe code completion and documentation:

        ```tsx
        <Workbook
          licenseKey="YOUR_LICENSE_KEY"
          customer={customer}
          onWorkbookLoad={handleWorkbookLoad}
          onStatusChange={handleStatusChange}
          onRowUpdate={handleRowUpdate}
          // And any other available properties
        />
        ```
        </div>
  </div>

</div>
