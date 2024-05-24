
### April 10, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.9.0

        This package enables developers to integrate Flatfile's data import experience into their React application.

The changes include:

- Adding new components for configuring Flatfile's Space, Workbook, Sheet, and Document within a React context.
- Adding hooks for handling events and record data from Flatfile.
- Adding utility functions for creating and configuring a Flatfile Space.
- Refactoring the existing components and hooks to use the new React context.

Some key changes to note:

1. The `FlatfileProvider` component sets up a FlatfileContext with configurations for the Space, Workbook, Document, and event handlers. This allows child components to access and update these configurations.

2. The `Space` component handles initializing a Flatfile Space and renders its children within the context of that Space.

3. The `Sheet` component allows configuring a Flatfile Sheet, handling onSubmit events, and manipulating records using hooks.

4. The `Workbook` component updates the Workbook configuration and handles onSubmit events.

5. The `Document` component updates the Document configuration within the FlatfileContext.

6. New hooks like `useEvent`, `usePlugin`, and `useListener` allow handling Flatfile events and record data within React components.

This update enables developers to configure and integrate Flatfile's data import functionality more seamlessly within their React applications, with improved control over the Flatfile context and event handling.
        </div>
  </div>

</div>
