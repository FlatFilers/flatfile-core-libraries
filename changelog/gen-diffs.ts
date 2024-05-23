import fs from "node:fs";

// the first package in the each package array is the comparison package
// -> a list of three packages will produce 2 diffs
const packages =[
    // react
    [
        "@flatfile/react@7.9.6",
        "@flatfile/react@7.9.7",
        "@flatfile/react@7.9.8"
    ],
    // angular
    [
        // ??
    ],
    // vue 
    [
        "@flatfile/vue@1.0.13",
        "@flatfile/vue@1.0.15",
        "@flatfile/vue@1.0.16",
    ],
    // javascript
    [
        "@flatfile/javascript@1.3.4",
        "@flatfile/javascript@1.3.6",
        "@flatfile/javascript@1.3.7",
    ],
    // cli
    [
        "flatfile@3.6.5",
        "flatfile@3.6.7",
        "flatfile@3.6.8"
    ],
    // listener
    [
        "@flatfile/listener@1.0.2",
        "@flatfile/listener@1.0.4",
        "@flatfile/listener@1.0.5",
    ]
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
