import fs from "fs";
const { execSync } = require('child_process');

fs.mkdirSync('git-diffs', { recursive: true });
fs.mkdirSync('release-notes', { recursive: true });
execSync('npx tsx ./gen-diffs.ts')
execSync('chmod +x diffs.sh')
execSync('./diffs.sh')
fs.rmSync('diffs.sh')
execSync('npx tsx ./summarize.ts')

