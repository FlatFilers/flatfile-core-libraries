import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import { Flatfile } from '@flatfile/api'
import boxen from 'boxen'
import ora from 'ora'
import uuid from 'uuid'

import { config } from '../../config'
import { authAction } from './auth.action'
import UploadFile from '../../../../v2-shims/src/legacy/upload.file'

export async function quickstartAction(
  options: Partial<{
    account: string
    env: string
    endpoint: string
  }>
) {
  const apiUrl =
    options.endpoint || config().endpoint || process.env.FLATFILE_API_URL

  if (!apiUrl) {
    console.log(
      `You must provide a API Endpoint URL. Either set the ${chalk.bold(
        'FLATFILE_API_URL'
      )} environment variable, 'endpoint' in your .flatfilerc or pass the ID in as an option to this command with ${chalk.bold(
        '--endpoint'
      )}`
    )
    process.exit(1)
  }

  const clientId = config().clientId
  if (!clientId) {
    console.log(`You must provide a secret. Set 'clientId' in your .flatfilerc`)
    process.exit(1)
  }

  const secret = config().secret

  if (!secret) {
    console.log(`You must provide a secret. Set 'secret' in your .flatfilerc`)
    process.exit(1)
  }

  try {
    // Create and authenticated API client
    const apiClient = await authAction({ apiUrl, clientId, secret })

    if (!apiClient) {
      console.log('Failed to create API Client')
      process.exit(1)
    }

    // Find or Create Environment
    const envSpinner = ora({
      text: `Create Environment`,
    }).start()

    const newEnvironmentCreated = await apiClient.environments.create({
      name: 'Quickstart',
      isProd: false,
    })
    const environmentId = newEnvironmentCreated?.data?.id ?? ''
    envSpinner.succeed(`Environment created:  ${chalk.dim(environmentId)}`)

    // Create a Space
    const spaceSpinner = ora({
      text: `Create Space`,
    }).start()
    let space
    try {
      space = await apiClient.spaces.create({
        name: `Platform SDK Space`,
        environmentId,
      })
      if (!space?.data) {
        spaceSpinner.fail(`Failed to create space`)
        process.exit(1)
      }
    } catch (err) {
      spaceSpinner.fail(`Failed to create space ${chalk.dim({ err })}`)
      process.exit(1)
    }

    spaceSpinner.succeed(`Space Created ${chalk.dim(space?.data?.id)}`)
    const spaceId = space?.data?.id || ''

    // Create a Workbook
    const workbookSpinner = ora({
      text: `Create Workbook`,
    }).start()

    const workbook = await apiClient.workbooks.create({
      name: `Platform SDK Workbook`,
      spaceId,
      environmentId,
      sheets: [
        {
          fields: [
            {
              key: 'first_name',
              type: 'string',
              label: 'First Name',
              description: 'The first name',
              constraints: [
                {
                  type: 'required',
                },
              ],
            },
            {
              key: 'last_name',
              type: 'string',
              label: 'Last Name',
              description: 'The last name',
            },
            {
              key: 'email',
              type: 'string',
              label: 'Email',
              description: "The person's email",
              constraints: [
                {
                  type: 'unique',
                },
              ],
            },
            {
              key: 'phone',
              type: 'string',
              label: 'Phone Number',
              description: "The person's phone number",
            },
            {
              key: 'date of birth',
              type: 'date',
              label: 'Date of Birth',
              description: "The person's birth date",
            },
            {
              key: 'country',
              type: 'string',
              label: 'Country',
              description: 'The formatted country code',
            },
            {
              key: 'postalCode',
              type: 'string',
              label: 'Postal Code',
              description: 'Zip or Postal Code',
            },
            {
              key: 'subscriber',
              type: 'boolean',
              label: 'Subscriber?',
              description: 'Whether the person is already a subscriber',
            },
            {
              key: 'type',
              type: 'enum',
              label: 'Deal Status',
              description: 'The deal status',
              config: {
                options: [
                  {
                    value: 'new',
                    label: 'New',
                  },
                  {
                    value: 'interested',
                    label: 'Interested',
                  },
                  {
                    value: 'meeting',
                    label: 'Meeting',
                  },
                  {
                    value: 'opportunity',
                    label: 'Opportunity',
                  },
                  {
                    value: 'unqualified',
                    label: 'Not a fit',
                  },
                ],
              },
            },
          ],
          name: 'Contacts',
        },
      ],
    })

    const primaryWorkbookId = workbook?.data?.id || ''
    workbookSpinner.succeed(
      `Workbook created:  ${chalk.dim(primaryWorkbookId)}`
    )

    // Update the space with the primary workbook ID
    await apiClient.spaces.update(spaceId, {
      environmentId,
      primaryWorkbookId,
    })

    spaceSpinner.succeed(`Space created:  ${chalk.dim(spaceId)}`)

    // Create an Agent with the default Data Hook
    const agentSpinner = ora({
      text: `Create Agent`,
    }).start()

    const buildFile = path.join(
      __dirname,
      '..',
      'src',
      'x',
      'files',
      'agent.js'
    )
    const buffer = fs.readFileSync(buildFile)
    const source = buffer.toString()
    try {
      const agent = await apiClient.agents.create({
        environmentId,
        body: {
          topics: [
            Flatfile.EventTopic.RecordsCreated,
            Flatfile.EventTopic.RecordsUpdated,
            Flatfile.EventTopic.FileCreated,
          ],
          compiler: 'js',
          source,
        },
      })
      agentSpinner.succeed(`Agent Created ${chalk.dim(agent?.data?.id)}\n`)
    } catch (e) {
      agentSpinner.fail(`Agent failed to be created ${chalk.dim(e)}\n`)
    }

    // agentSpinner.succeed(`Agent Created ${chalk.dim(agent?.data?.id)}\n`)
    if (!workbook?.data?.sheets) {
      console.log('No sheets found')
      process.exit(1)
    }

    // TODO: make url configurable for Local vs Prod
    const workbookSummary = `Check out your Workbook! -> ${chalk.blue(
      `http://localhost:6789/space/${spaceId}/workbook/${primaryWorkbookId}/sheet/${workbook?.data?.sheets[0].id}`
    )}`

    console.log(`🎉 Deploy successful! 🎉`)
    console.log(
      boxen(`${workbookSummary}`, {
        title: 'Summary',
        titleAlignment: 'left',
        padding: 1,
        borderColor: 'magenta',
        margin: { top: 2, bottom: 2, right: 0, left: 0 },
      })
    )
  } catch (e) {
    console.log(e)
  }
}
