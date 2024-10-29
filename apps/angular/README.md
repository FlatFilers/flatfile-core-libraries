> **Warning**
>
> In order to publish this package you'll need to:
>
> 1. set `name` in **package.json**
> 2. set `private: false` in **package.json**
> 3. set `publishConfig.access` in **package.json** to appropriate access level

# Basic Package

This package scaffold is intended to be used with the SDK [Monorepo](https://github.com/FlatFilers/platform-sdk-mono) and is preconfigured with:

- typescript
- eslint
- jest

### Useful Commands

- `npm run build` - Build the package
- `npm run dev` - Run all development build and watch locally
- `npm run lint` - Lint the packages
- `npm run clean` - Removes `node_modules`, `dist` folder, and `.turbo` caches
- `npm run test` - Run tests
