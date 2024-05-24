
### February 29, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/javascript@1.2.6

        This release includes a fix to ensure that only defined parameters are included in the space creation request. When initializing the Flatfile experience with `startFlatfile()`, the `namespace`, `translationsPath`, and `languageOverride` options are now only included in the request if they are provided. This change helps prevent sending unnecessary parameters and streamlines the integration process. Developers using this package can expect a more efficient and reliable data import experience powered by Flatfile's robust capabilities. Upgrade to take advantage of this improvement today!
        </div>
  </div>

</div>
