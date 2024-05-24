This is a work in progress applying Nate's Claude work from flatfile-node to the core libraries.


1. Update the list of packages changelogs are to be generated for in `gen-diffs.ts`.
2. Run `npx tsx run.ts` to generate a changelog.
3. Run `npx tsx summarize.ts` to generate additional results if needed.


Immediate Follow Ups:

- Refine prompts, work to improve tone and context
- Create context guides to aid prompt quality
- Expand to all packages
- Expand to include summaries for sdk highlights section

Questions:
- Do we want to regenerate the RSS feeds for plugins and core library packages? Right now they are simply the changeset commits.
- Might we be able to link the changed to the PRs that generated them? Both for pulling in any assets and for review context.


Manifest ideas...

```yml
# config.yml

directories:
  diffs: "./changelog/diffs"
  output: "./changelog/release-notes"
  source: "./packages"

claude:
  api_key: "your-claude-api-key"

prompt: 'General repo prompt.'

packages:
  react:
    verions:
        - "@flatfile/react@7.8.0"
        - "@flatfile/react@7.8.1"
    output:
        function: { template function for formatting }
        inputs:
            - packageName
            - releaseDate
            - etc
    prompt: 'Specific instructions for this package.'
    context:
        - path/to/context/guides
        - path/to/context/guides2


  listener:
    verions:
        - "@flatfile/listener@1.0.0"
        - "@flatfile/listener@1.0.1"
        function: { template function for formatting }
        inputs:
            - packageName
            - releaseDate
            - etc
    prompt: 'Specific instructions for this package.'
    context:
        - path/to/context/guides
        - path/to/context/guides2


