import { Blueprint } from '@flatfile/api'
import { Agent } from '../ddl/Agent'

// TODO: first pass at useConfigure Plugin. Does not register hooks, only deploys the spaceConfig
export const createBlueprintFromConfigure = (agent: Agent) => {
  const {
    options: { spaceConfigs },
  } = agent
  for (const slug in spaceConfigs) {
    const spaceConfig = spaceConfigs[slug]

    try {
      const spacePatternConfig = {
        name: spaceConfig.options.name,
        // TODO Do we need a unique slug for this in the Platform SDK or X? Should we generate them in X?
        slug,
        blueprints: mapObj(
          spaceConfig.options.workbookConfigs,
          (wb, wbSlug, i) => {
            return {
              name: wb.options.name,
              slug: `${slug}/${wbSlug}`,
              primary: i === 0,
              sheets: mapObj(wb.options.sheets, (model, modelSlug) =>
                model.toBlueprint(wbSlug, modelSlug)
              ),
            } as Blueprint
          }
        ),
      }
      return spacePatternConfig
    } catch (e) {
      console.log(`Error Creating Space Config: ${e}`)
    }
  }
}

function mapObj<T, K>(
  obj: Record<string, K>,
  cb: (value: K, key: string, i: number) => T
): T[] {
  const slugs = Object.keys(obj)
  let i = 0
  return slugs.map((slug) => {
    const model = obj[slug]
    return cb(model, slug, i++)
  })
}
