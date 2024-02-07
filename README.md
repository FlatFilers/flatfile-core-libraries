# Flatfile Core Libraries

This monorepo is configured with the following tools:

- [Turborepo](https://turborepo.org) - Monorepo build system
- [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) - Managing workspaces
- [Changesets](https://github.com/changesets/changesets) - Managing versioning and changelogs
- [Automated Publishing](https://github.com/changesets/action) - Fully automated package publishing
- [tsup](https://github.com/egoist/tsup) — TypeScript bundler
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io)

## Getting Started

Running `npm install` from the root directory will install dependencies for all workspaces.

### Useful Commands

- `npm run build` - Build all packages
- `npm run dev` - Run all packages locally
- `npm run lint` - Lint all packages
- `npm run changeset` - Generate a changeset
- `npm run clean` - Removes all `node_modules`, `dist` folders, and `.turbo` caches (runs each package's clean script)
- `npm install somePackage -w packageName -w anotherPackage` - Run a command only in the context of a specific package. This example would install `somePackage` in the `packageName` workspace and the `anotherPackage` within the monorepo
- `turbo run dev --filter packageName` - Run the turbo dev command but only for `pacakgeName`
- `./dev make:package foo-bar` - Generates a new package under the packages directory using a pre-configured package template

### Apps and Packages

Workspaces are configured in the root level `package.json`:

```json
{
  "workspaces": ["packages/*", "apps/*"]
}
```

Any directory inside a workspace that also defines their own `package.json` will be considered an independent workspace.

> **Note**
>
> When you move, delete, or rename your workspaces, you will have to make sure that all folders linked within your package.json matches. Anytime you change the configuration of your workspace, make sure all the dependencies of the workspace are also updated. Re-run your npm client's install command to check your configuration. If there are any problems after that, you may have to delete your node_modules folder and run an install again.

#### Dev cli

A light weight dev cli is provided to quickly scaffold a new package for this mono repo. Running `./dev make:package <package>` with create a package pre-configured with typescript, eslint, jest, and tsup. The package will be placed in the **packages** directory by default.

#### Managing dependencies

To use dependencies from one workspace in another define it the `package.json` like so:

```json
"dependencies": {
    "@flatfile/orm": "*",
    "@flatfile/hooks": "*",
    ...
}
```

When defined this way NPM will first look for a workspace package locally before trying the registry. Afterward, use the dependency as usual:

```js
import { TPrimitive } from '@flatfile/orm'
```

To manage dependencies within individual workspaces, you will need to run commands that filter to a specific workspace or workspaces rather than the entire monorepo:

```bash
# Install/Update/Etc
npm install <package> -w=<workspace>

# Example
npm install react -w=web
```

### Turborepo

In the root level `package.json` you'll also notice some pre-defined commands including:

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --no-cache --parallel --continue",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules"
  }
}
```

Using the `turbo` command here allows us to take advantage of the speed provided by turbo's [caching](https://turborepo.org/docs/core-concepts/caching) and build [pipelines](https://turborepo.org/docs/core-concepts/pipelines)

## Versioning & Publishing Packages

> **Warning**
>
> Do NOT publish packages manually from your local environment. This will confuse the automation and make sadness.

Package publishing is automated through changeset and github workflows. To instigate publication:

1. Make a change to a package
2. Run `npm run changeset`, choose the package(s) that were modified, and follow instructions to fill out changelog details
3. Push the resulting `.changeset` file along with the package changes from the first step
4. Create PR with these changes and merge into main

This will trigger a Github action to create a new PR with the increased version and changelog. Once this PR gets merged, CI runs again and releases the package(s) to npm.
