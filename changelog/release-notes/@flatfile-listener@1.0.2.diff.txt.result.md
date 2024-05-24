
### April 10, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/core.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/listener@1.0.2

        This release includes an enhancement to the @flatfile/listener package that adds the ability to remove event listeners. A new off() method has been introduced in the EventHandler class, allowing developers to detach event callbacks based on the query, filter, or callback function. This provides more control over managing event subscriptions. Additionally, a detach() method has been added to the EventHandler class, enabling the removal of all registered listeners and optionally detaching child nodes. A utility function isEqual() has also been included to facilitate comparisons between queries and filters. For the FlatfileListener class, a new fork() method has been implemented, allowing the creation of a new independent instance. Overall, these changes provide more flexibility and management capabilities for event handling in Flatfile applications, enhancing the developer experience.
        </div>
  </div>

</div>
