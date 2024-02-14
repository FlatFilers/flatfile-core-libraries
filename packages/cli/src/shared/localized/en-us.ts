import chalk from 'chalk'
import { docUrls } from '../messages'
import { agentTable } from '../../x/helpers/agent.table'

export const en_us = {
  noEntryFile: `No entry file found
  
  Please specify the exact path to the entry file one of these ways:
  - Via the CLI command (eg. npx flatfile deploy ./src/my-file.js)
  - Adding an 'entry' configuration to your .flatfilerc file`,

  noApiUrl: `No api url configured
    
  Please specify the api url one of these ways:
  - Set the ${chalk.bold('FLATFILE_API_URL')} environment variable
  - Add an 'endpoint' configuration to your .flatfilerc file
  - Pass the -h, --api-url flag (eg. npx flatfile deploy ${chalk.bold(
    '--api-url'
  )} ${docUrls.api}/v1)`,

  invalidCredentials: `Invalid credentials
    
  Please check your username and password and try again.`,

  noApiKey: `You must provide a valid credential
    
  Please specify your credentials one of these ways:
  - Set the ${chalk.bold('FLATFILE_API_KEY')} environment variable 
  - Set the ${chalk.bold('FLATFILE_BEARER_TOKEN')} environment variable
  - Adding an 'api_key' configuration to your .flatfilerc file
  - Pass the -k, --token flag (eg. npx flatfile deploy ${chalk.bold(
    '--token'
  )} my-api-key)
  Please reference our authentication documentation for further information:
  ${chalk.underline.blue(docUrls.authentication)}`,


  warnDeployedAgents: (agents: any) =>  {
    return `${chalk.yellow('[WARN] You already have deployed agents!')} 
    
${agentTable(agents, false)}

There may be unintended conflicts should you proceed with local development.
Please see our shared environments documentation for further information:
${chalk.underline.blue(docUrls.sharedEnvironments)}\n`},

  noEnvironments: `No environments found
  
  No environments were found in your Flatfile account. Please create an environment before deploying.
  See our environments documentation for further information:
  ${chalk.underline.blue(docUrls.environments)}`,

  failedToCreateEnvironment: (
    name: string,
    error: any
  ) => `Failed to create environment: ${chalk.dim(name)}
      
  ${chalk.dim(error)}`,

  noEnvironmentName: `You must provide a environment name.
      
  Pass the -n, --name flag (eg. npx flatfile create:env ${chalk.bold(
    '--name'
  )} my-env-name)`,

  noPackageJSON: `No package.json found
  
  These is no package.json file in your current directory. Please deploy from the root of your project.`,

  listenerNotInstalled: `@flatfile/listener not installed
  
  You must install the @flatfile/listener package to use the deploy command.
  
  npm install @flatfile/listener`,

  setVariablesHelp: `
Set up an environment variable using your preferred approach:

- If you're developing in a cloud environment like repl.it or codesandbox, 
  look for the SECRETS feature and add a secret named FLATFILE_API_KEY. 
- Locally consider using a .env file that is not committed to your git repository.`,

  apiResponse: (text: any) => `No response from API

Please check your api url configuration, see logs for details
${chalk.dim(text)}`,

  flatfilercConfig: (text: string) => `You must provide a ${text}
    
  Add a '${text}' configuration to your .flatfilerc file`,

  getEnvironmentsError: (text: any) => `Error retrieving environments
    
  ${chalk.dim(text)}`,

  error: (text: any) => `\nAn error occurred
  
  Please check logs for details:
  ${chalk.dim(text)}`,

  warn: (warning: any, text: any) => `${chalk.yellow('[WARN] ' + warning)}
  
  ${chalk.dim(text)}`,
}
