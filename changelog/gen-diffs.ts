import fs from "node:fs";

// the first package in the each package array is the comparison package
// -> a list of three packages will produce 2 diffs
const packages =[
    // react
    [
        "@flatfile/react@7.8.0",
        "@flatfile/react@7.8.1",
        "@flatfile/react@7.8.2",
        "@flatfile/react@7.8.3",
        "@flatfile/react@7.8.4",
        "@flatfile/react@7.8.5",
        "@flatfile/react@7.8.6",
        "@flatfile/react@7.8.7",
        "@flatfile/react@7.8.8",
        "@flatfile/react@7.8.9",
        "@flatfile/react@7.8.10",
        "@flatfile/react@7.8.11",
        "@flatfile/react@7.8.12",
        "@flatfile/react@7.9.0",
        "@flatfile/react@7.9.1",
        "@flatfile/react@7.9.2",
        "@flatfile/react@7.9.3",
        "@flatfile/react@7.9.5",
        "@flatfile/react@7.9.6",
        "@flatfile/react@7.9.7",
        "@flatfile/react@7.9.8",
    ],
    // angular
    // [

    // ],
    // vue 
    // [
    //     "@flatfile/vue@0.0.1",
    //     "@flatfile/vue@0.0.2",
    //     "@flatfile/vue@0.0.3",
    //     "@flatfile/vue@0.0.4",
    //     "@flatfile/vue@0.0.5",
    //     "@flatfile/vue@0.0.6",
    //     "@flatfile/vue@0.0.7",
    //     "@flatfile/vue@0.0.8",
    //     "@flatfile/vue@0.0.9",
    //     "@flatfile/vue@0.0.10",
    //     "@flatfile/vue@0.0.11",
    //     "@flatfile/vue@0.0.12",
    //     "@flatfile/vue@1.0.0",
    //     "@flatfile/vue@1.0.1",
    //     "@flatfile/vue@1.0.2",
    //     "@flatfile/vue@1.0.3",
    //     "@flatfile/vue@1.0.4",
    //     "@flatfile/vue@1.0.5",
    //     "@flatfile/vue@1.0.6",
    //     "@flatfile/vue@1.0.7",
    //     "@flatfile/vue@1.0.8",
    //     "@flatfile/vue@1.0.9",
    //     "@flatfile/vue@1.0.10",
    //     "@flatfile/vue@1.0.11",
    //     "@flatfile/vue@1.0.12",
    //     "@flatfile/vue@1.0.13",
    //     "@flatfile/vue@1.0.15",
    //     "@flatfile/vue@1.0.16",
    // ],
    // javascript
    [
        "@flatfile/javascript@1.1.8",
        "@flatfile/javascript@1.2.0",
        "@flatfile/javascript@1.2.1",
        "@flatfile/javascript@1.2.2",
        "@flatfile/javascript@1.2.3",
        "@flatfile/javascript@1.2.4",
        "@flatfile/javascript@1.2.5",
        "@flatfile/javascript@1.2.6",
        "@flatfile/javascript@1.3.0",
        "@flatfile/javascript@1.3.1",
        "@flatfile/javascript@1.3.2",
        "@flatfile/javascript@1.3.3",
        "@flatfile/javascript@1.3.6",
        "@flatfile/javascript@1.3.7",
    ],
    // cli
    [
        "flatfile@3.5.14",
        "flatfile@3.5.15",
        "flatfile@3.6.0",
        "flatfile@3.6.1",
        "flatfile@3.6.2",
        "flatfile@3.6.3",
        "flatfile@3.6.4",
        "flatfile@3.6.5",
        "flatfile@3.6.7",
        "flatfile@3.6.8"
    ],
    // listener
    [
        "@flatfile/listener@1.0.0",
        "@flatfile/listener@1.0.1",
        "@flatfile/listener@1.0.2",
        "@flatfile/listener@1.0.4",
        "@flatfile/listener@1.0.5",
    ],
    // record hook ??
    // [
    //     // "@flatfile/plugin-record-hook@1.1.2",
    // ],
    // api ??
    // [
    //     // "@flatfile/api@1.5.21"
    // ]
]

function getPackageNameFromFilename(filename: string) {
    const fileString = filename.includes('@flatfile') ? filename.split('@')[1] : 'flatfile';
    switch (fileString) {
        case 'flatfile':
            return 'flatfile'
        case 'flatfile/react':
            return 'react'
        case 'flatfile/vue':
            return 'vue'
        case 'flatfile/javascript':
            return 'javascript'
        case 'flatfile/listener':
            return 'listener'
        case 'flatfile/angular':
            return 'angular'
        default:
            return ''
    }
}

let script: string[] = [];

for (const packageVersions of packages) {
    let compareVersion = packageVersions[0];

    for (let i = 1; i < packageVersions.length; i++) {
        const version = packageVersions[i];
        const packageName = getPackageNameFromFilename(version)
        script.push(
            `( git diff --no-color -U1 ${compareVersion}..${version} -- ../packages/${packageName} ':!yarn.lock' ) | grep -v '"X-' > git-diffs/${version.replace("/", "-")}.diff.txt`
        );
        compareVersion = version;
    }
}

fs.writeFileSync("diffs.sh", script.join("\n"))
