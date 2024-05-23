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
- Do we want to regenerate the rss feeds for plugins and core library packages? Right now they are simply the changeset commits.
- Might we be able to link the changed to the PRs that generated them? Both for pulling in any assets and for review context.
