import { WebServer } from "maishu-node-web-server";
import { imageWatermark } from "./image-request-processor/image-watermark";
let webServer = new WebServer({
    port: 9268, websiteDirectory: __dirname,
    requestProcessorConfigs: {
        StaticFile: {
            staticFileExtentions: ['.jpg', '.gif']
        }
    }
});

webServer.contentTransforms.push(imageWatermark);