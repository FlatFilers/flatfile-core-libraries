import { Flatfile, FlatfileClient } from '@flatfile/api'

export class JobHandler {
  private readonly jobId: string
  private readonly api: FlatfileClient

  constructor(jobId: string) {
    this.jobId = jobId
    this.api = new FlatfileClient()
  }

  async ack() {
    try {
      await this.api.jobs.ack(this.jobId)
    } catch (err) {
      console.error('Failed to ack the job: ', err)
    }
  }

  async cancel() {
    try {
      await this.api.jobs.cancel(this.jobId)
    } catch (err) {
      console.error('Failed to cancel the job: ', err)
    }
  }

  async complete() {
    try {
      await this.api.jobs.complete(this.jobId)
    } catch (err) {
      console.error('Failed to complete the job: ', err)
    }
  }

  async fail() {
    try {
      await this.api.jobs.fail(this.jobId)
    } catch (err) {
      console.error('Failed to fail the job: ', err)
    }
  }

  async get() {
    try {
      await this.api.jobs.get(this.jobId)
    } catch (err) {
      console.error('Failed to get the job: ', err)
    }
  }
}
