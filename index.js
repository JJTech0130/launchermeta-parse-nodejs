const got = require('got');
const fs = require('fs/promises');
const path = require('path');
const conf = require('./config.json');

const metahost = 'dl.jjtech.dev';

async function getManifest(url) {
    console.log("[getManifest] Downloading " + url);
    
    let response = await got(url);
    let manifest = JSON.parse(response.body);
    
    return manifest;
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
    if (!(version.type.includes('old'))) {
        let manifest = await getManifest(version_url.href);
        let new_manifest = await processManifest(manifest);

        filename = './out' + version_url.pathname;
        console.log("Writing manifest to " + filename);
        fs.mkdir(path.dirname(filename), { recursive: true }, (err) => {
            if (err) console.log(err);
            console.log('Created dir');
        });
        fs.writeFile(filename,JSON.stringify(new_manifest, null, 4), (err) => {
            if (err) console.log(err);
            console.log('wrote file');
        });


        //console.log(manifest);
    }
}

async function main() {
    let manifest = await getManifest(conf.version_manifest);
    let versions = manifest.versions;

    versions.forEach(version => processVersion(version));
}

main();