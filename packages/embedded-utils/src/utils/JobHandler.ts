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
      console.error(`Failed to acknowledge job with ID ${this.jobId}: `, err)
    }
  }

  async cancel() {
    try {
      await this.api.jobs.cancel(this.jobId)
    } catch (err) {
      console.error(`Failed to cancel job with ID ${this.jobId}: `, err)
    }
  }

  async complete() {
    try {
      await this.api.jobs.complete(this.jobId)
    } catch (err) {
      console.error(`Failed to complete job with ID ${this.jobId}: `, err)
    }
  }

  async fail() {
    try {
      await this.api.jobs.fail(this.jobId)
    } catch (err) {
      console.error(`Failed to fail job with ID ${this.jobId}: `, err)
    }
  }

  async get() {
    try {
      await this.api.jobs.get(this.jobId)
    } catch (err) {
      console.error(`Failed to get job with ID ${this.jobId}: `, err)
    }
  }
}
