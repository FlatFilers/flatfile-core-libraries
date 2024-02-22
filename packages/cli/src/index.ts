#!/usr/bin/env node
import { program } from 'commander'
import dotenv from 'dotenv'
import ora from 'ora'

import packageJSON from '../package.json'
import './config'
import { publishAction as legacyPublishAction } from './legacy/actions/publish'
import { writeErrorToFile } from './shared/utils/error'
import { switchInit } from './switch.init'
import { switchVersion } from './switch.version'
import { createEnvironmentAction } from './x/actions/create.environment.action'
import { deployAction } from './x/actions/deploy.action'
import { deleteAction } from './x/actions/delete.action'
import { developAction } from './x/actions/develop.action'
import { publishAction } from './x/actions/publish.action'
import { publishPubSub } from './x/actions/publish.pubsub'
import { quickstartAction } from './x/actions/quickstart.action'
import { listAgentsAction } from './x/actions/list-agents.action'

dotenv.config()

program
  .name('flatfile')
  .description('Flatfile CLI')
  .version(`${packageJSON.version}`)
  .configureOutput({
    outputError: async (errorMessage: string) => {
      ora({
        text: errorMessage,
      }).fail()
    },
  })
  .exitOverride(writeErrorToFile)

program
  .command('publish <file>')
  .description('publish a Workbook')
  .option('-t, --team <team-id>', 'the Team ID to publish to')
  .option('--api-url <url>', 'the API url to use')
  .action(switchVersion(legacyPublishAction, publishAction))

program
  .command('deploy [file]')
  .description('Deploy your project as a Flatfile Agent')
  .option(
    '-s, --slug <slug>',
    'the slug of the project to deploy (or set env FLATFILE_AGENT_SLUG)'
  )
  .option(
    '-t, --topics <topics>',
    `list of the topics to listen on (or set env FLATFILE_AGENT_TOPICS)
    eg: 'commit:created,commit:updated'`
  )
  .option(
    '-k, --token <token>',
    'the authentication token to use (or set env FLATFILE_API_KEY or FLATFILE_BEARER_TOKEN)'
  )
  .option(
    '-h, --api-url <url>',
    '(optional) the API URL to use (or set env FLATFILE_API_URL)'
  )
  .action(deployAction)

program
  .command('develop [file]')
  .alias('dev [file]')
  .description('Run your project as a Flatfile listener')
  .option(
    '-k, --token <string>',
    'the authentication token to use (or set env FLATFILE_API_KEY or FLATFILE_BEARER_TOKEN)'
  )
  .option(
    '-h, --api-url <url>',
    '(optional) the API URL to use (or set env FLATFILE_API_URL)'
  )
  .option(
    '-e, --env <env-id>',
    '(optional) the Environment to use (or set env FLATFILE_ENVIRONMENT_ID)'
  )
  .action(developAction)

program
  .command('delete')
  .description('Delete an Agent')
  .option('-s, --slug <slug>', 'the slug of the agent to delete')
  .option('-ag, --agentId <id>', 'the id of the agent to delete')
  .option(
    '-k, --token <token>',
    'the authentication token to use (or set env FLATFILE_API_KEY or FLATFILE_BEARER_TOKEN)'
  )
  .option(
    '-h, --api-url <url>',
    '(optional) the API URL to use (or set env FLATFILE_API_URL)'
  )
  .action(deleteAction)

program
  .command('list')
  .description('List deployed Agents')
  .option(
    '-k, --token <token>',
    'the authentication token to use (or set env FLATFILE_API_KEY or FLATFILE_BEARER_TOKEN)'
  )
  .option(
    '-h, --api-url <url>',
    '(optional) the API URL to use (or set env FLATFILE_API_URL)'
  )
  .option('-t, --with-topics', '(optional) display the topics for each agent')
  .action(listAgentsAction)

program
  .command('init')
  .description('Initialize a project')
  .option('-e, --environment <env>', 'the Environment to publish to')
  .option('-k, --key <key>', 'the API Key to use')
  // TODO: clean up clientId vs. key across v3 vs x implementations
  .option('-c, --clientId <clientId>', 'the clientId to use')
  .option('-n, --name <name>', 'the name of the your project')
  .option('-s, --secret <secret>', 'the API Secret to use')
  .option('-t, --team <team>', 'the Team ID to publish to')
  .option('-x', 'initialize the project to deploy to X')
  .action(switchInit)

program
  .command('quickstart')
  .description('initialize a quickstart Workbook')
  .option('-t, --team <team-id>', 'the Team ID to publish to')
  .option('--api-url <url>', 'the API url to use')
  .action(quickstartAction)

program
  .command('create:env')
  .description('Create an Environment')
  .option('-n, --name <name>', 'the name of the environment to create')
  .option('-k, --key <key>', 'the API Key to use')
  .option('-s, --secret <secret>', 'the API Secret to use')
  .action(createEnvironmentAction)

program
  .command('pubsub <file>')
  .description('publish a PubSub Agent (deprecated)')
  .option('-t, --team <team-id>', 'the Team ID to publish to')
  .option('--api-url <url>', 'the API url to use')
  .action(publishPubSub)

program.parse()
