
### March 22, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.8.10

        In this release, a bug has been fixed in the `usePortal` hook related to the `onSubmit` function. The bug caused issues when the `onSubmit` function was called from within the React portal. To resolve this issue, the import of the `api` object from the `@flatfile/api` package has been updated. Instead of using the default export, a new instance of the `FlatfileClient` class is now created, providing a more robust solution compatible with different build tooling. This change ensures that the `onSubmit` function in the `usePortal` hook works correctly, improving the reliability of the data import experience for developers using the `@flatfile/react` package. Exciting improvements to enhance the developer experience!
        </div>
  </div>

</div>
