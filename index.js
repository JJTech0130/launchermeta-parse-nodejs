const got = require('got');

async function getManifest(url) {
    console.log("[getManifest] Downloading " + url);
    let response = await got(url);
    let manifest = JSON.parse(response.body);
    return manifest;
}

async function main() {
    let manifest = await getManifest('https://launchermeta.mojang.com/mc/game/version_manifest.json');
    let versions = manifest.versions;

    versions.forEach(async function(version) {
        // old_alpha and old_beta versions have weird natives and are not (yet) supported
        if (!(version.type.includes('old'))) {
            let vmanifest = await getManifest(version.url);
            vmanifest.libraries.forEach(async function(lib) {
                if (lib.name.includes('org.lwjgl.lwjgl:lwjgl-platform:')) {
                    if (lib.downloads.classifiers['natives-linux'] != undefined) {
                        console.log(lib.downloads.classifiers['natives-linux'].url);
                    }
                    else {
                        console.log(lib.name + ' does not include \'natives-linux\'');
                    }
                }
            })
            //console.log(vmanifest.libraries);
        }
    });
}

main();