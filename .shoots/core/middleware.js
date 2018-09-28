const fs = require('fs');
const path = require('path');

const workFolder = path.join(__dirname, '..', 'middleware');

module.exports = function(opts) {
    const middlewares = {}
    let files = fs.readdirSync(workFolder);
    files.forEach(function(file) {
        console.log("==> moddleware", file);
        try {
            let fileInfo = path.parse(file);
            if (fileInfo.ext === ".js") {
                let middleware = require(path.join(workFolder, file));
                let name = file.substr(0, file.length - 3);
                middlewares[name] = middleware;
            }
        } catch (e) {
            console.error(e);
        } finally {}
    });

    return function middleware(ctx, next) {
        ctx.shoots = middlewares;
        return next();
    }
}
