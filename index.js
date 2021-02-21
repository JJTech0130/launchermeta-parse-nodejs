const got = require('got');
const s3 = require("@aws-sdk/client-s3");
const fs = require('fs/promises');
const path = require('path');
const conf = require('./config.json');

async function getManifest(url) {
    return got(url)
    .then(response => JSON.parse(response.body))
    .catch(e => console.error("Error parsing manifest: " + e.message));
}

async function processManifest(manifest) {
    for (let lib in manifest.libraries) {    
        if (manifest.libraries[lib].name.includes('org.lwjgl.lwjgl:lwjgl-platform:')) {
            if (manifest.libraries[lib].downloads.classifiers['natives-linux'] != undefined) {
                natives_url = new URL(manifest.libraries[lib].downloads.classifiers['natives-linux'].url);
                natives_url.host = conf.new_host;
                
                //console.log(natives_url.href);
                
                manifest.libraries[lib].downloads.classifiers['natives-linux'].url = natives_url.href;

            }
        }
    }
    return manifest;
}
async function processVersion(version) {
    let version_url = new URL(version.url);
    
    console.log("Queued " + version.id);

    fs.mkdir(path.dirname('./out' + version_url.pathname), { recursive: true })
    .catch(e => console.error("Error while creating directory: " + e));

    getManifest(version_url.href)
    .then(manifest => processManifest(manifest))
    .catch(e => console.error("Error processing manifest: " + e))
    .then(manifest => fs.writeFile('./out' + version_url.pathname, JSON.stringify(manifest, null, 4)))
    .catch(e => console.error("Error writing manifest: "+ e));

    version_url.host = conf.new_host;
    version.url = version_url.href;

    return version;
}


async function main() {
    getManifest(conf.version_manifest)
    .then(manifest => manifest.versions
        .forEach(version => processVersion(version)))
    .catch(e => console.error("Error: " + e.message));
}

main();