import axios from 'axios';
import fs from 'fs-extra';
import tar from 'tar';
import ora from 'ora';
import { Command } from 'commander';

export const downloadAction = (program: Command) => {
  program
    .command('download')
    .description('Download an agent code from Flatfile API')
    .option('-s, --slug <slug>', 'the slug of the agent to download')
    .option('-k, --token <token>', 'the authentication token')
    .option('-h, --api-url <url>', '(optional) the API URL')
    .action(async (options) => {
      const spinner = ora('Fetching agents...').start();
      try {
        const { slug, token, apiUrl } = options;
        const agentsUrl = `${apiUrl || 'https://api.flatfile.com'}/v1/agents`;
        const agentsResponse = await axios.get(agentsUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const agents = agentsResponse.data;
        const agent = agents.find((a: any) => a.slug === slug);

        if (!agent) {
          spinner.fail('Agent not found.');
          return;
        }

        const url = `${apiUrl || 'https://api.flatfile.com'}/v1/agents-exports/${agent.id}/download`;
        spinner.text = 'Downloading agent...';
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'stream',
        });

        const tempFilePath = `./${slug}.tgz`;
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
          spinner.succeed('Download complete. Extracting files...');
          await tar.x({ file: tempFilePath, C: './' });
          await fs.remove(tempFilePath);
          ora().succeed('Extraction complete.');
        });

        writer.on('error', (err: Error) => {
          spinner.fail('Failed to download agent.');
          console.error(err);
        });
      } catch (error) {
        spinner.fail('An error occurred.');
        console.error(error);
      }
    });
}; 