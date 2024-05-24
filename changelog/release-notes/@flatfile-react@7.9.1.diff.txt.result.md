
### April 17, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.9.1

        This release updates the @flatfile/react package to improve the submission process. After successfully uploading data, the onSubmit action handlers now automatically acknowledge the job and set acknowledge: true. This provides better feedback to users that their data has been successfully submitted. Additionally, the job completion message has been updated to a more user-friendly "Submitting data is now complete!". These changes enhance the user experience when integrating Flatfile's data import capabilities into applications.

For example, when a user submits data through the Flatfile interface, they will now see a confirmation message stating "Submitting data is now complete!" to indicate their upload was successful. Developers utilizing this package do not need to make any code changes to take advantage of these improvements.
        </div>
  </div>

</div>
