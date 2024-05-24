
### February 20, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.8.3

        The latest release (7.8.3) includes an important bug fix related to updating the authentication token for the @flatfile/listener package. This patch release ensures that the listener authentication token is updated correctly when the accessToken or apiUrl props change, resolving an issue where the token was not being refreshed properly. This fix is crucial for maintaining secure and authorized communication between the Flatfile API and the embedded data import experience. Developers using the @flatfile/react package will benefit from this improved token handling, ensuring a seamless and secure data import flow within their applications.
        </div>
  </div>

</div>
