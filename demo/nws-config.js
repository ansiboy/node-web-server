const path = require("path");

module.exports = {
    "port": 4612,
    "virtualPath": {
        "static": path.join(__dirname, "../out/static")
    }
}