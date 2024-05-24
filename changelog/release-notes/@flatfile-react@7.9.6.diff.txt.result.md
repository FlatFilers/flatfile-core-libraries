
### May 21, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.9.6

        The @flatfile/react package has received the following updates:

- Fixed a bug where ISO dates were automatically converted to JavaScript Date objects, which could cause issues. The package now preserves ISO date strings correctly.

- Added a new `defaultPage` prop to the `Document` and `Sheet` components. This allows setting the default page that opens in the Flatfile portal when the space loads. Developers can specify the default document or sheet to open initially.

- Improved the styling and animations of the embedded iFrame overlay and container. The iFrame now has a smooth fade transition and an updated box shadow.

- Added the ability to reset the space when closing the Flatfile portal. This cleans up data and prepares for a fresh space on the next open. Developers can control this behavior with the new `resetOnClose` config option.

- Implemented better handling of the Flatfile API key and URL, making it easier to use the @flatfile/api client library alongside the React components.

- Fixed issues with the embedded iFrame not rendering correctly in certain cases.

- Added console warnings when attempting to set multiple default pages, as only one can be set per space.

Overall, this release improves styling, adds useful new features like setting a default page, fixes bugs around date handling and iFrame rendering, and provides better integration with the Flatfile API client library. Developers can now customize the initial Flatfile experience more easily within their React applications.
        </div>
  </div>

</div>
