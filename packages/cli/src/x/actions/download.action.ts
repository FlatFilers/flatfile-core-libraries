import axios from 'axios';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import { apiKeyClient } from './auth.action'
import { getAuth } from '../../shared/get-auth'
import { program } from 'commander'
import { messages } from '../../shared/messages'
import { execSync } from 'child_process';

export async function downloadAction(
  slug: string,
  options?: Partial<{
    apiUrl: string
    token: string
    env: string
    exportType: 'SOURCE' | 'AUTOBUILD_INLINED'
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
    spinner.text = 'Searching for agent...';
    const { data: agents } = await apiClient.agents.list({
      environmentId: environment?.id!,
    });

    if (!agents || agents.length === 0) {
      spinner.fail(`No agents found in this environment`);
      return;
    }

    const matchingAgents = agents.filter(agent => agent.slug === slug);
    
    if (matchingAgents.length === 0) {
      spinner.fail(`No agent found with slug: ${slug}`);
      return;
    }

    const agent = matchingAgents[0];
    spinner.succeed(`Found agent: ${agent.slug}`);
    
    const exportType = options?.exportType || 'SOURCE';
    
    spinner.text = 'Creating agent export job...';
    
    const jobResponse = await axios({
      method: 'POST',
      url: `${apiUrl}/v1/jobs`,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Disable-Hooks': 'true'
      },
      data: {
        type: 'agent',
        operation: 'agent-export',
        source: agent.id,
        environmentId: agent.environmentId,
        config: {
          exportType
        },
        trigger: 'immediate',
        status: 'executing'
      }
    });
    
    const jobId = jobResponse.data.data.id;
    spinner.succeed(`Export job created with ID: ${jobId}`);
    
    spinner.text = 'Waiting for export job to complete...';
    
    let jobCompleted = false;
    let downloadUrl = '';
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!jobCompleted && attempts < maxAttempts) {
      attempts++;
      
      try {
        spinner.text = `Checking job status... (attempt ${attempts}/${maxAttempts})`;
        
        const jobStatusResponse = await axios({
          method: 'GET',
          url: `${apiUrl}/v1/jobs/${jobId}`,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        const job = jobStatusResponse.data.data;        
        if (job.status === 'complete') {
          jobCompleted = true;
          spinner.succeed(`Job completed with status: ${job.status}`);
          
          if (job.outcome?.next?.type === 'download' && job.outcome.next.url) {
            downloadUrl = job.outcome.next.url;
            console.log('downloadUrl', downloadUrl);
            spinner.succeed('Export job completed successfully with download URL');
          } else {
            spinner.fail('Job completed but no download URL was provided');
            console.log('Job outcome:', JSON.stringify(job.outcome, null, 2));
            return;
          }
        } else if (job.status === 'failed') {
          spinner.fail(`Export job failed: ${job.info || 'Unknown error'}`);
          console.log('Job details:', JSON.stringify(job, null, 2));
          return;
        } else if (job.status === 'executing' || job.status === 'queued' || job.status === 'ready') {
          spinner.text = `Job in progress with status: ${job.status} (attempt ${attempts}/${maxAttempts})`;
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          spinner.text = `Job has status: ${job.status} (attempt ${attempts}/${maxAttempts})`;
          console.log(`Job with unexpected status: ${job.status}`, JSON.stringify(job, null, 2));
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        console.error('Error checking job status:', error);
        
        if (error.response) {
          console.log('Error response status:', error.response.status);
          console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
        }
        
        spinner.text = `Error checking job status, retrying... (attempt ${attempts}/${maxAttempts})`;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!jobCompleted) {
      spinner.fail(`Export job timed out after ${maxAttempts} attempts`);
      console.log('The job may still be processing. You can try again later or check the job status in the Flatfile dashboard.');
      return;
    }
    
    spinner.text = 'Downloading agent export...';
    const downloadResponse = await axios.get(`${apiUrl}${downloadUrl}`, { 
      responseType: 'arraybuffer',  // Use arraybuffer instead of blob for Node.js
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });
    
    const tempDir = path.join(process.cwd(), '.flatfile');
    await fs.ensureDir(tempDir);
    const tempFilePath = path.join(tempDir, `${slug}-${exportType.toLowerCase()}.tgz`);
    
    await fs.writeFile(tempFilePath, Buffer.from(downloadResponse.data));
    
    const stats = await fs.stat(tempFilePath);
    console.log(`File written successfully. Size: ${stats.size} bytes`);
    
    spinner.succeed(`Downloaded agent export to ${tempFilePath}`);
    
    spinner.text = 'Extracting agent export...';
    
    const targetDir = path.join(process.cwd(), slug);
    await fs.ensureDir(targetDir);
    await fs.emptyDir(targetDir);
        
    try {
      execSync(`tar -xzf "${tempFilePath}" -C "${targetDir}"`, { stdio: 'inherit' });
      await fs.remove(tempFilePath);
      
      spinner.succeed(`Successfully extracted agent to ${targetDir}`);
      console.log(`\nAgent ${slug} has been downloaded and extracted to ${targetDir}`);
    } catch (extractError) {
      const debugFilePath = path.join(process.cwd(), `${slug}-debug.tgz`);
      await fs.copyFile(tempFilePath, debugFilePath);
      throw extractError;
    }
  } catch (error: any) {
    spinner.fail('An error occurred during the agent export process.');
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}; 