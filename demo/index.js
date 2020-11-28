"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maishu_node_web_server_1 = require("maishu-node-web-server");
const image_watermark_1 = require("./image-request-processor/image-watermark");
let webServer = new maishu_node_web_server_1.WebServer({
    port: 9268, websiteDirectory: __dirname,
    requestProcessorConfigs: {
        StaticFile: {
            staticFileExtentions: ['.jpg', '.gif']
        }
    }
});
webServer.contentTransforms.push(image_watermark_1.imageWatermark);
