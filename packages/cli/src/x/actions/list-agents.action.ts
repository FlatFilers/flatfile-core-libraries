import { program } from 'commander'
import ora from 'ora'
import { apiKeyClient } from './auth.action'
import { getAuth } from '../../shared/get-auth'
import { messages } from '../../shared/messages'
import { agentTable } from '../helpers/agent.table'

export async function listAgentsAction(
  options?: Partial<{
    withTopics: boolean
    token: string
    apiUrl: string
  }>
): Promise<void> {
  let authRes
  try {
    authRes = await getAuth(options)
  } catch (e) {
    return program.error(messages.error(e))
  }
  const { apiKey, apiUrl, environment } = authRes

  // Create and authenticated API client
  const apiClient = apiKeyClient({ apiUrl, apiKey: apiKey! })

  const validatingSpinner = ora({
    text: `Checking for deployed agents...`,
  }).start()

  try {
    const { data } = await apiClient.agents.list({
      environmentId: environment?.id!,
    })

    if (!data || data.length === 0) {
      validatingSpinner.fail('No agents found')
      process.exit(1)
    }

    validatingSpinner.succeed(`Deployed Agents:\n`)
    console.log(agentTable(data, !!options?.withTopics))
  } catch (e) {
    return program.error(messages.error(e))
  }
}
