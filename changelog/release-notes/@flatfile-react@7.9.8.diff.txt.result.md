
### May 22, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.9.8

        The latest release of the @flatfile/react package includes an exciting improvement that gives developers more control over opening the Flatfile portal. The key change is the addition of a new "ready" state that determines whether the portal should be visible or not. Specifically, the EmbeddedIFrameWrapper component now uses the ready state along with the open state to control the opacity and pointer events of the portal iframe. The portal iframe will only be visible and interactive when both ready and open are true. Additionally, a new useEffect hook has been added to the useFlatfile hook that automatically creates or updates the Flatfile space when ready and open are true, eliminating the need for developers to manually handle this. Here's an example of how to use the new functionality:

```jsx
import { FlatfileProvider, useFlatfile } from '@flatfile/react';

const MyComponent = () => {
  const { openPortal, ready } = useFlatfile();

  return (
    <div>
      <button onClick={openPortal} disabled={!ready}>
        Open Flatfile Portal
      </button>
      <FlatfileProvider>
        {/* Flatfile components go here */}
      </FlatfileProvider>
    </div>
  );
};
```

In this example, the "Open Flatfile Portal" button will only be enabled when the ready state is true, ensuring that the portal will be visible and interactive when clicked. This new feature gives developers more control over the user experience and prevents the portal from being displayed or interacted with prematurely.
        </div>
  </div>

</div>
