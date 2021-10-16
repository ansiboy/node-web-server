const path = require("path");
const encoding = 'UTF-8'
module.exports = {
    "port": 4612,
    virtualPaths: {
        // "static": path.join(__dirname, "../out/static")
    },
    processors: {
        StaticFile: {
            contentTypes: {
                ".ts": `application/x-javascript; charset=${encoding}`,
            }
        }
    }
}