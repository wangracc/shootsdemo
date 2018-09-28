/*
获取 router 下
*/
const fs = require('fs');
const path = require('path');
const debug = require('debug')('shoots');

const workFolder = path.join(path.resolve(), 'server', 'router');
debug('router path', workFolder);

module.exports = function() {
    let result = [];
    if (!fs.existsSync(workFolder)) {
        debug('no router folder', workFolder);
        return result;
    }
    let routers = fs.readdirSync(workFolder);
    routers.forEach(function(file) {
        try {
            debug("==> router", file);
            let router = require(path.join(workFolder, file));
            result.push(router)
        } catch (e) {
            console.error(e.message);
            console.error(e.stack);
        }
    });
    return result;
}
