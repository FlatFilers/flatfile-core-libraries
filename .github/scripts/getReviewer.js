import dotenv from "dotenv"
dotenv.config()

import { Octokit } from "@octokit/rest"
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

const owner = process.env.OWNER
const repo = process.env.REPO
const tag = process.env.TAG

function extractCommits(prDescription) {
  const shaPattern = /### Patch Changes[\s\S]*?-\s+([a-f0-9]{7,40}):/g;
  const commitSHAs = []
  
  let match;
  while ((match = shaPattern.exec(prDescription)) !== null) {
    commitSHAs.push(match[1].trim())
  }
  return commitSHAs;
}

async function getAuthor(ref) {
  const { data } = await octokit.repos.getCommit({
    owner,
    repo,
    ref,
  })
  return data.author.login;
}

async function getReviewers({ tag }) {
  try {
    const { data } = await octokit.repos.getReleaseByTag({
      owner,
      repo,
      tag,
    })

    const commits = await extractCommits(data.body)
    return await Promise.all(commits.map(getAuthor))

  } catch (error) {
    console.error(`Error getting reviewers for release ${tag}`, error)
    return false
  }
}

getReviewers({ tag })