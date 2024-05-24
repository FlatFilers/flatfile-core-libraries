
### April 27, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.9.2

        This release of the @flatfile/react package includes several improvements and bug fixes. It fixes a bug with re-using spaces and resolves an issue that prevented clipboard access for embedded iframe components. Additionally, it updates the @flatfile/embedded-utils dependency to the latest version 1.2.0. For developers using this package, the ability to read and write to the clipboard within embedded iframe components is now enabled by adding the "allow" attribute with "clipboard-read" and "clipboard-write" permissions. The Space component now accepts an optional "id" prop alongside the existing "config" prop to allow better control over updating individual spaces. Overall, these changes enhance the functionality and address key issues, providing an improved experience for integrating Flatfile's data import capabilities into applications.
        </div>
  </div>

</div>
