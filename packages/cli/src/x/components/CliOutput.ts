import chalk from 'chalk'
import Table from 'cli-table3'
import ora, { Ora } from 'ora'

interface CliOutputProps {
  loading?: boolean
  error?: string
  data?: any
  resource: string
  method: string
}

const flattenObject = (obj: any, prefix = ''): any => {
  return Object.keys(obj).reduce((acc: any, k: string) => {
    const pre = prefix.length ? prefix + '.' : ''
    if (
      typeof obj[k] === 'object' && 
      obj[k] !== null && 
      !Array.isArray(obj[k]) &&
      Object.keys(obj[k]).length < 5
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k))
    } else {
      acc[pre + k] = typeof obj[k] === 'object' ? JSON.stringify(obj[k]) : obj[k]
    }
    return acc
  }, {})
}

const formatData = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data.map(item => flattenObject(item))
  }
  return [flattenObject(data)]
}

export class CliOutput {
  private spinner: Ora | null = null

  constructor(private props: CliOutputProps) {
    if (props.loading) {
      this.spinner = ora(`Executing ${props.resource}.${props.method}...`).start()
    }
  }

  public succeed(data?: any) {
    if (this.spinner) {
      this.spinner.succeed(chalk.green(`${this.props.resource}.${this.props.method} executed successfully`))
    }

    if (data) {
      const formattedData = formatData(data)
      const headers = Object.keys(formattedData[0])
      
      const table = new Table({
        head: headers.map(h => chalk.cyan(h)),
        style: { head: [], border: [] }
      })

      formattedData.forEach(row => {
        table.push(headers.map(h => row[h]))
      })

      console.log(table.toString())
    }
  }

  public fail(error: string) {
    if (this.spinner) {
      this.spinner.fail(chalk.red(`Error executing ${this.props.resource}.${this.props.method}`))
    }
    console.error(chalk.red(error))
  }
} 