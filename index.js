const got = require('got');

(async () => {
    try {
        const response = await got('https://launchermeta.mojang.com/mc/game/version_manifest.json');
        //let body = response.body;
        //console.log(response.body);
        version_manifest = JSON.parse(response.body);
        console.log(version_manifest.versions[0].id);
        //=> '<!doctype html> ...'
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
})();