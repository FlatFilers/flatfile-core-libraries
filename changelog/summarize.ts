const claudeApiKey = "";

import * as fs from "fs";
import * as path from "path";
import { sendPromptToClaude } from "./claude-ai";

function getPackageNameFromFilename(filename) {
    return filename.match(/^(.*?)(@\d+)/)[1].replace('git-diffs/', '').replace('-', '/')
}

function getPrompt(pkg) {
    // const pkg = getPackageNameFromFilename(fileName)
    console.log('PKG', pkg)
    switch (true) {
        case ['@flatfile/react', '@flatfile/angular', '@flatfile/vue', '@flatfile/javascript'].includes(pkg):
            console.log(pkg, 'wrapper')
            return `You are an AI assistant responsible for writing release notes. 
            You'll be given a git diff for Flatfile sdk package enabling developers to integrate Flatfile's data import experience into their application. 
            From the diff pull out the changes for the ${pkg} package and write detailed release notes that summarize those changes.
            Do not include changes for any package except the ${pkg} package.
            Take care to note any external interface changes in detail. 
            Use backticks to represent code blocks or property names in the output text. 
            Each section of the release notes should have a level-4 header (####).
            Only write release notes that are relevant to a consumer of the package. 
            Do not reference anything internal-only, do not reference file names.`
        case pkg.includes("listener"):
            console.log(pkg, 'listener')
            return `You are an AI assistant responsible for writing release notes. 
            You'll be given a git diff for Flatfile's listener package. 
            This package provides event handling capabilities with Flatfile-specific functionality. It's main function is to receive and respond to events.
            From the diff pull out the changes for the @flatfile/listener package and write detailed release notes that summarize those changes.
            Do not include changes for any package except the @flatfile/listener package.
            Take care to note any external interface changes in detail. 
            Use backticks to represent code blocks or property names in the output text. 
            Each section of the release notes should have a level-4 header (####).
            Only write release notes that are relevant to a consumer of the package. 
            Do not reference anything internal-only, do not reference file names.`
        case pkg.includes("flatfile@"):
            console.log(pkg, 'cli')
            return `You are an AI assistant responsible for writing release notes. 
            You'll be given a git diff for Flatfile's CLI package: a command-line tool that provides developers with commands to manage and configure their Flatfile integration.
            From the diff pull out the changes for the flatfile package and write detailed release notes that summarize those changes.
            Do not include changes for any package except the flatfile package.
            Take care to note any external interface changes in detail. 
            Use backticks to represent code blocks or property names in the output text. 
            Each section of the release notes should have a level-4 header (####).
            Only write release notes that are relevant to a consumer of the package. 
            Do not reference anything internal-only, do not reference file names.`
             default:
            console.log(pkg, 'NOT FOUND!!!!!!')
            return ''
    }
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
                fs.writeFileSync(resultFilePath, claudeResponse);
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