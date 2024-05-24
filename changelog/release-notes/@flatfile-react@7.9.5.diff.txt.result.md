
### May 01, 2024

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/wrappers.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        @flatfile/react@7.9.5

        This release updates several dependencies and improves the build tooling for the @flatfile/react package. The build process has been optimized for faster compilation times. The @rollup/plugin-typescript dependency has been replaced with @rollup/plugin-sucrase for faster TypeScript and JSX transpilation. The @flatfile/api, @flatfile/cross-env-config, @flatfile/embedded-utils, @flatfile/listener, and @flatfile/plugin-record-hook dependencies have been upgraded to their latest versions. These updates bring performance enhancements and potentially new features from the upstream packages to your application. Developers integrating Flatfile's data import experience can expect a smoother development workflow with faster build times.

Example usage remains the same:

```jsx
import { FlatfileButton } from '@flatfile/react'

const MyComponent = () => (
  <FlatfileButton 
    licenseKey="YOUR_LICENSE_KEY"
    settings={{ type: 'Import' }}
  />
)
```
        </div>
  </div>

</div>
