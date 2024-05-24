
### March 08, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.8.8

        This release fixes an issue where the embedded Flatfile iframe would not be removed properly if there was an error during initialization. Now, whenever the user closes the modal, the iframe will be unmounted reliably to ensure a clean state, regardless of any previous errors. This improvement enhances the integration's stability and provides a smoother experience for developers using the @flatfile/react package in their applications. With this bug fix, developers can confidently leverage Flatfile's data import functionality without worrying about lingering iframe instances or inconsistent UI states after encountering errors.
        </div>
  </div>

</div>
