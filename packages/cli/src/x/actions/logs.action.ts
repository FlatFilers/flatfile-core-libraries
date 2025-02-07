// import { Command } from 'commander'
// import { FlatfileClient } from '@flatfile/api'
// import { getAgentInfo } from '../utils/agent'
// import chalk from 'chalk'

// export const logsAction = new Command('logs')
//   .description('Stream debug logs from a Flatfile agent')
//   .argument('[agentId]', 'The ID of the agent to stream logs from')
//   .option('-f, --follow', 'Follow log output', false)
//   .option('-e, --events', 'Show Flatfile events', false)
//   .action(async (agentId, options) => {
//     const client = new FlatfileClient()
    
//     // If no agentId provided, get the default agent
//     if (!agentId) {
//       const agent = await getAgentInfo()
//       agentId = agent.id
//     }

//     console.log(`Streaming logs for agent: ${agentId}`)

//     // Subscribe to debug logs
//     await client.events.subscribe({
//       topics: ['debug:log', 'debug:error', 'debug:event'],
//       filter: { agentId },
//       callback: (event) => {
//         switch (event.topic) {
//           case 'debug:log':
//             const { level, message } = event.data
//             const color = {
//               log: chalk.white,
//               error: chalk.red,
//               warn: chalk.yellow,
//               info: chalk.blue
//             }[level] || chalk.white
            
//             console.log(color(`[${level.toUpperCase()}] ${formatMessage(message)}`))
//             break

//           case 'debug:error':
//             console.error(chalk.red(`[ERROR] ${event.data.message}`))
//             if (event.data.stack) {
//               console.error(chalk.gray(event.data.stack))
//             }
//             break

//           case 'debug:event':
//             if (options.events) {
//               console.log(chalk.cyan(`[EVENT] ${event.data.topic}`))
//               if (event.data.data) {
//                 console.log(chalk.gray(JSON.stringify(event.data.data, null, 2)))
//               }
//             }
//             break
//         }
//       }
//     })

//     // Keep connection open if following
//     if (options.follow) {
//       await new Promise(() => {}) // Keep process alive
//     }
//   })

// function formatMessage(message: any[]): string {
//   return message.map(item => 
//     typeof item === 'object' ? JSON.stringify(item, null, 2) : item
//   ).join(' ')
// } 