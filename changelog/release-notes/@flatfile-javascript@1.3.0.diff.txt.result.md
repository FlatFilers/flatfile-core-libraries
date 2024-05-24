
### March 15, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/javascript@1.3.0

        This release includes several updates to the @flatfile/javascript package that streamline the data import experience for developers:

        The package now offers a new initNewSpace utility that enables developers to create a new space, workbook, and document in a single API request, simplifying the integration process. This utility returns the initial resources needed to render the embedded UI experience. A new InitialResourceData type has been introduced to represent the data returned from this API call.

        The environmentId parameter has been made optional when creating a new workbook, providing more flexibility for developers. 

        Overall, these changes make it easier for developers to integrate Flatfile's data import capabilities into their applications by reducing the number of API calls required and providing a more streamlined initialization process. Developers can now obtain all the necessary resources to render the embedded UI with a single request using the new initNewSpace utility.
        </div>
  </div>

</div>
