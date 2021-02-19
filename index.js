const got = require('got');
const fs = require('fs/promises');

const metahost = 'https://dl.jjtech.dev/';

async function getManifest(url) {
    console.log("[getManifest] Downloading " + url);
    
    let response = await got(url);
    let manifest = JSON.parse(response.body);
    
    return manifest;
}

async function processVersion(version) {
    if (!(version.type.includes('old'))) {
        let manifest = await getManifest(version.url);

        for (let lib in manifest.libraries) {
            
            if (manifest.libraries[lib].name.includes('org.lwjgl.lwjgl:lwjgl-platform:')) {
                
                if (manifest.libraries[lib].downloads.classifiers['natives-linux'] != undefined) {
                    
                    let oldurl = manifest.libraries[lib].downloads.classifiers['natives-linux'].url;
                    let newurl = oldurl.replace('https://libraries.minecraft.net/', metahost);
                    
                    console.log('[processVersion: ' + version.id + '] Replacing ' + oldurl + ' with ' + newurl);
                    
                    manifest.libraries[lib].downloads.classifiers['natives-linux'].url = newurl;

                }
            }
        }

        console.log(manifest);
    }
}

async function main() {
    let manifest = await getManifest('https://launchermeta.mojang.com/mc/game/version_manifest.json');
    let versions = manifest.versions;

    versions.forEach(version => processVersion(version));
}

main();