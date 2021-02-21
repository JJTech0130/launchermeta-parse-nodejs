const got = require('got');
const JSONStream = require('JSONStream');
const fs = require('fs/promises');
const path = require('path');
const conf = require('./config.json');

const metahost = 'dl.jjtech.dev';

function streamManifest(url, path) {
    return got.stream(url)
    .pipe(JSONStream.parse(path));
}

/*
async function getManifest(url) {
    //console.log("[getManifest] Downloading " + url);
    
    return got(url)
    .then(response => JSON.parse(response.body))
    .catch(e => console.error("Error parsing manifest: " + e.message));

    //let response = await got(url);
    //let manifest = JSON.parse(response.body);
    
    //return manifest;
}
*/

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

        console.log("Creating directory " + path.dirname(filename));

        console.log("Writing manifest to " + filename);

        /*fs.mkdir(path.dirname(filename), { recursive: true }, (err) => {
            if (err) console.log(err);
            console.log('Created dir');
        });
        fs.writeFile(filename,JSON.stringify(new_manifest, null, 4), (err) => {
            if (err) console.log(err);
            console.log('wrote file');
        });*/
    }
}

/*
async function main() {
    let manifest = await getManifest(conf.version_manifest);
    let versions = manifest.versions;

    versions.forEach(version => processVersion(version));
}
*/

function main() {
    let stream = streamManifest(conf.version_manifest, ['versions', true, 'id']);
    stream.on('data', function(data) {
        console.log(data); // Prints all versions
    });
}

main();