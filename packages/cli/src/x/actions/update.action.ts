import axios from 'axios';
import fs from 'fs-extra';
import tar from 'tar';
import ora from 'ora';
import { apiKeyClient } from './auth.action'
import { getAuth } from '../../shared/get-auth'
import { program } from 'commander'
import { messages } from '../../shared/messages'

export async function updateAction(
  slug: string | null | undefined,
  options?: Partial<{
    apiUrl: string
    token: string
    env: string
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
  const spinner = ora('Fetching agents...').start();
      try {
        // 1. List agent exports and see if there is a match

        // const listAgentExportsResponse = await axios.get(
        //   `${apiUrl}/v1/agent-exports/`,
        //   { headers: { Authorization: `Bearer ${apiKey}` }
        // })
        // console.log('List the agent exports', listAgentExportsResponse.data);





// 2. If there's no match 



      

      // const { data } = await apiClient.agentExports.get({
      //     agentId: agent.id,
      //   })

        const agents = data;
        const agent = agents?.find((a: any) => a.slug === slug);

        if (!agent || !agent.id) {
          spinner.fail('Agent not found.');
          return;
        }
        spinner.text = 'Downloading agent...';



        

        // TODO: list the agent exports & retrieve the id



        // TODO: download the agent export
        // const url = `${apiUrl}/v1/agent-exports/${agent.id}/download`;
        // const response = await axios.get(url, {
        //   headers: { Authorization: `Bearer ${apiKey}` },
        //   responseType: 'blob',
        // });


        console.log('response', response.status);

        // const tempFilePath = `./${slug}.tgz`;
        // const writer = fs.createWriteStream(tempFilePath);
        // response.data.pipe(writer);

        // writer.on('finish', async () => {
        //   spinner.succeed('Download complete. Extracting files...');
        //   await tar.x({ file: tempFilePath, C: './' });
        //   await fs.remove(tempFilePath);
        //   ora().succeed('Extraction complete.');
        // });

        // writer.on('error', (err: Error) => {
        //   spinner.fail('Failed to download agent.');
        //   console.error(err);
        // });
      } catch (error) {
        spinner.fail('An error occurred.');
        console.error(error);
      }

}; 