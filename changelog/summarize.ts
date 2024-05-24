const claudeApiKey = "";

import * as fs from "fs";
import * as path from "path";
import { sendPromptToClaude } from "./claude-ai";
const { execSync } = require('child_process');

function getPackageNameFromFilename(filename) {
    return filename.match(/^(.*?)(@\d+)/)[1].replace('git-diffs/', '').replace('-', '/')
}

function formattedSummary(date, version, type, summary) {
return `
### ${date}

<div style={{ display: "table", width: "auto" }}>

  <div style={{ display: "table-row", width: "auto" }}>
      <Snippet file="chips/${type}.mdx" />
        <div style={{ float: "left", display: "table-column", paddingLeft: "30px", width: "calc(80% - 30px)" }}>
        ${version}

        ${summary}
        </div>
  </div>

</div>
`
}

function getPrompt(pkg) {
    const packageInstructions = ['@flatfile/react', '@flatfile/angular', '@flatfile/vue', '@flatfile/javascript'].includes(pkg) ?
        `This package enables developers to integrate Flatfile's data import experience into their application.` :
    pkg.includes("listener") ?
        `This package provides event handling capabilities with Flatfile-specific functionality. It's main function is to receive and respond to events.` :
    pkg.includes("flatfile@") ?
        `This package provides developers with commands to manage and configure their Flatfile integration.` : ''

    return `You are an AI assistant responsible for writing release notes. 
    ${packageInstructions}
    From the diff write detailed release notes that summarize the changes.
    Include no headings.
    Write in full sentences describing the changes.
    Limit the summary to 1-5 sentences.
    Add a slight enthusiastic promotional element to the tone.
    Do not include changes for any package except the ${pkg} package.
    Take care to note any external interface changes in detail, include any new or changed parameters.
    Only write release notes that are relevant to a consumer of the package.
    Be specific about what the changes mean to the developer using the package.
    Do not reference anything internal-only, do not reference file names.
    Provide code examples where relevant.`
}

let totalCount = 0;

async function processFile(
    filePath: string,
    extension: string,
    callback: (fileContent: string) => Promise<string>,
    apiKey: string
) {
    if (path.extname(filePath).toLowerCase() === extension) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const prompt = await callback(fileContent);
        const resultFilePath = `${filePath.replace("git-diffs", "release-notes")}.result.md`;
        
        const pkg = getPackageNameFromFilename(filePath)
     
        if (!fs.existsSync(resultFilePath)) {
            console.log(`Processing ${filePath}...`);
            try {
                totalCount++;
                if (totalCount > 4) {
                    console.log("SKIP " + filePath);
                    return;
                }
                const filePrompt = getPrompt(pkg);
                if (!filePrompt) {
                    throw new Error(`No prompt found for file: ${filePath}`);
                }
                const claudeResponse = await sendPromptToClaude(
                    filePrompt,
                    [{ role: "user", content: prompt }],
                    apiKey
                );

                // Variables to input into the formattedSummary function
                const versionMatch = filePath.match(/@(\d+\.\d+\.\d+)\.diff\.txt/);
                const version = versionMatch ? versionMatch[1] : null;
                const tag = `${pkg}@${version}`
                const tagDate = execSync(`git log -1 --format=%aD ${tag}`).toString().trim()
                const releaseDate = new Date(tagDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
                const type = pkg === 'flatfile' || pkg === '@flatfile/listener' ? 'core' : 'wrappers'
            
                fs.writeFileSync(resultFilePath, formattedSummary(releaseDate, tag, type, claudeResponse));
                console.log(`Processed ${filePath} and saved the result to ${resultFilePath}`);
            } catch (error) {
                console.error(`Error processing ${filePath}: ${error}`);
            }
        } else {
            console.log(`Result file ${resultFilePath} already exists, skipping...`);
        }
    }
}

async function processDirectory(
    dirPath: string,
    extension: string,
    callback: (fileContent: string) => Promise<string>,
    apiKey: string
) {
    const files = fs.readdirSync(dirPath);
    const promises: Promise<void>[] = [];

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            promises.push(processDirectory(filePath, extension, callback, apiKey));
        } else {
            promises.push(processFile(filePath, extension, callback, apiKey));
        }
    }

    await Promise.all(promises);
}

// Usage example
const directoryPath = "./git-diffs";
const fileExtension = ".txt";

const promptCallback = async (fileContent: string): Promise<string> => {
    // Generate the prompt based on the file content
    // This is just an example, you can modify it as needed
    return `Generate a summary of changes for the following text diff: ${fileContent}`;
};

processDirectory(directoryPath, fileExtension, promptCallback, claudeApiKey).catch((error) =>
    console.error("Error:", error)
);