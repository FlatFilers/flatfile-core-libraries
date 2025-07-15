import { program } from 'commander'
import ora from 'ora'
import { clearCredentials, loadCredentials } from '../utils/credentials'

export async function logoutAction() {
  const spinner = ora('Logging out...').start()

  try {
    const currentCredentials = await loadCredentials()
    
    if (!currentCredentials) {
      spinner.info('You are not currently logged in.')
      return
    }

    await clearCredentials()
    spinner.succeed(`Logged out from Flatfile (${currentCredentials.region}).`)
  } catch (error: any) {
    spinner.fail('Logout failed')
    program.error(`Logout failed: ${error.message}`)
  }
}
