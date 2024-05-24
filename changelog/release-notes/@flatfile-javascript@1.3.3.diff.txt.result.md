
### April 27, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/javascript@1.3.3

        This release includes an important fix to enable clipboard read and write functionality within the embedded Flatfile iframe component. Developers can now seamlessly integrate copy and paste capabilities into their application's data import experience powered by Flatfile. Additionally, the @flatfile/embedded-utils dependency has been updated to version 1.2.0, which likely includes performance enhancements and bug fixes. Upgrade to this latest version to take advantage of these improvements and unlock a more seamless data import workflow for your users!

        Example usage:

        ```js
        import { createIframe } from '@flatfile/javascript';

        const iframe = createIframe({
          // ...config
        });
        ```
        </div>
  </div>

</div>
