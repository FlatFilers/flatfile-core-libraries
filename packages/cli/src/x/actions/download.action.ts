import axios from 'axios'
import { execSync } from 'child_process'
import { program } from 'commander'
import fs from 'fs-extra'
import ora from 'ora'
import path from 'path'
import { getAuth } from '../../shared/get-auth'
import { messages } from '../../shared/messages'
import { apiKeyClient } from './auth.action'

export async function downloadAction(
  options?: Partial<{
    slug: string
    agentId: string
    apiUrl: string
    token: string
    env: string
  }>
): Promise<void> {
  const { slug, agentId } = options ?? {}

  let authRes
  try {
    authRes = await getAuth(options)
  } catch (e) {
    return program.error(messages.error(e))
  }
  const { apiKey, apiUrl, environment } = authRes

  if (!slug && !agentId) {
    ora({ text: 'No slug or agentId provided' }).fail()
    process.exit(1)
  }

  const apiClient = apiKeyClient({ apiUrl, apiKey: apiKey! })
  const spinner = ora('Fetching agents...').start()

  try {
    spinner.text = 'Searching for agent...'
    const { data: agents } = await apiClient.agents.list({
      environmentId: environment?.id!,
    })

    if (!agents || agents.length === 0) {
      spinner.fail(`No agents found in this environment`)
      return
    }

    const agent = agents.find((agent) => {
      if (slug) {
        return agent.slug === slug
      } else if (agentId) {
        return agent.id === agentId
      }
    })

    if (!agent) {
      spinner.fail(
        `No agent found with ${slug ? `slug: ${slug}` : `id: ${agentId}`}`
      )
      return
    }

    spinner.succeed(`Found agent: ${agent.slug}`)

    const exportType = (agent as any)?.config?.autobuildId
      ? 'SYSTEM_COMBINED'
      : 'SOURCE'

    spinner.text = 'Creating agent export job...'

    const jobResponse = await axios({
      method: 'POST',
      url: `${apiUrl}/v1/jobs`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Disable-Hooks': 'true',
      },
      data: {
        type: 'agent',
        operation: 'agent-export',
        source: agent.id,
        environmentId: agent.environmentId,
        config: {
          exportType,
        },
        trigger: 'immediate',
        status: 'executing',
      },
    })

    const jobId = jobResponse.data.data.id
    spinner.succeed(`Create agent export job created: ${jobId}`)

    spinner.text = 'Waiting for export job to complete...'

    let jobCompleted = false
    let downloadUrl = ''
    let attempts = 0
    const maxAttempts = 30

    while (!jobCompleted && attempts < maxAttempts) {
      attempts++

      try {
        spinner.text = `Checking job status... (attempt ${attempts}/${maxAttempts})`
        const jobStatusResponse = await axios({
          method: 'GET',
          url: `${apiUrl}/v1/jobs/${jobId}`,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        })

        const job = jobStatusResponse.data.data
        if (job.status === 'complete') {
          jobCompleted = true
          if (job.outcome?.next?.type === 'download' && job.outcome.next.url) {
            downloadUrl = job.outcome.next.url
            spinner.succeed('Export job completed successfully')
          }
        } else if (job.status === 'failed') {
          spinner.fail(`Export job failed: ${job.info || 'Unknown error'}`)
          return
        } else if (
          job.status === 'executing' ||
          job.status === 'queued' ||
          job.status === 'ready'
        ) {
          spinner.text = `Job in progress with status: ${job.status} (attempt ${attempts}/${maxAttempts})`
          await new Promise((resolve) => setTimeout(resolve, 2000))
        } else {
          spinner.text = `Job has status: ${job.status} (attempt ${attempts}/${maxAttempts})`
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      } catch (error: any) {
        console.error('Error checking job status:', error)

        if (error.response) {
          console.log('Error response status:', error.response.status)
          console.log(
            'Error response data:',
            JSON.stringify(error.response.data, null, 2)
          )
        }

        spinner.text = `Error checking job status, retrying... (attempt ${attempts}/${maxAttempts})`
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    if (!jobCompleted) {
      spinner.fail(`Export job timed out after ${maxAttempts} attempts`)
      console.log(
        'The job may still be processing. You can try again later or check the job status in the Flatfile dashboard.'
      )
      return
    }

    spinner.text = 'Downloading agent export...'
    const downloadResponse = await axios.get(`${apiUrl}${downloadUrl}`, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const tempDir = path.join(process.cwd(), '.flatfile')
    await fs.ensureDir(tempDir)
    const tempFilePath = path.join(
      tempDir,
      `${slug}-${exportType.toLowerCase()}.tgz`
    )

    await fs.writeFile(tempFilePath, Buffer.from(downloadResponse.data))
    spinner.succeed('Downloaded agent export')

    try {
      const beforeExtraction = await fs.readdir(process.cwd())
      execSync(`tar -xzf "${tempFilePath}"`, { stdio: 'inherit' })
      const afterExtraction = await fs.readdir(process.cwd())
      const newDirs = afterExtraction.filter((item) => {
        return (
          !beforeExtraction.includes(item) &&
          fs.statSync(path.join(process.cwd(), item)).isDirectory()
        )
      })
      const extractedDir = newDirs.length > 0 ? newDirs[0] : slug
      await fs.remove(tempFilePath)

      spinner.succeed(`Successfully extracted agent to ./${extractedDir}`)
    } catch (extractError) {
      const debugFilePath = path.join(process.cwd(), `${slug}-debug.tgz`)
      await fs.copyFile(tempFilePath, debugFilePath)
      throw extractError
    }
  } catch (error: any) {
    spinner.fail('An error occurred during the agent export process.')
    if (error.response) {
      console.log('Error', JSON.stringify(error.response.data, null, 2))
    }
  }
}
