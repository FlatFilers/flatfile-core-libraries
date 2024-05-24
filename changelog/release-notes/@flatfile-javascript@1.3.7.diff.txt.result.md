
### May 22, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/javascript@1.3.7

        This release adds the ability to set the default page when preloading the Flatfile Portal embed. Developers can now specify which workbook, sheet, or document page should be displayed initially when the embed loads. This is a useful enhancement that provides more control over the initial user experience. To set the default page, use the updateDefaultPageInSpace function along with the new findDefaultPage utility. For example:

        ```js
        import { findDefaultPage, updateDefaultPageInSpace } from '@flatfile/embedded-utils';

        const defaultPage = findDefaultPage(workbook, document);
        await updateDefaultPageInSpace(createdSpace, defaultPage);
        ```

        The release also includes some internal refactoring and code cleanup, but no other major user-facing changes. Upgrade to take advantage of this new default page setting functionality!
        </div>
  </div>

</div>
