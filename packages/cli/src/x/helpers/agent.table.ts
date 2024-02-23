import { table } from 'table'
import { tableConfig } from '../../shared/constants'

export const agentTable = (agents: any[], withTopics: boolean) => {

    const agentList = agents.map((a) => {
        const agentInfo = [
          a.slug, 
          a.id, 
          `${new Date(a.updated_at).toLocaleDateString()} ${new Date(a.updated_at).toLocaleTimeString()}`, // human readable or leave as ISO string?
        ]
        if (withTopics) {
          agentInfo.push(a.topics?.join('\n'))
        }
        return agentInfo 
      })
  
      const headers = withTopics ? ['Slug', 'ID', 'Last Updated', 'Topics'] : ['Slug', 'ID', 'Last Updated']
      agentList.unshift(headers)

    return table(agentList, tableConfig)

}