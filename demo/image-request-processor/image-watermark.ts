import { RequestContext, RequestProcessor, RequestResult, RequestResultTransform } from "maishu-node-web-server";
import * as stream from "stream";
import * as Jimp from 'jimp';

export let imageWatermark: RequestResultTransform = async function (result: RequestResult, context: RequestContext) {
    var buffer = await getContentAsBuffer(result);

    var font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
    var image = await Jimp.read(buffer);
    image.print(font, 10, 10, "NODE-WEB-SERVER");
    var b = await image.getBufferAsync(Jimp.MIME_JPEG);
    result.content = b;
    return result;
}

function getContentAsBuffer(r: RequestResult): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        if (r.content instanceof stream.Readable) {
            let buffer = Buffer.from([]);
            r.content.on("data", (data) => {
                buffer = Buffer.concat([buffer, data])
            })
            r.content.on("end", function () {
                resolve(buffer)
            })
            r.content.on("error", function (err) {
                reject(err);
            })
        }
        else if (typeof r.content == "string") {
            var b = Buffer.from(r.content);
            resolve(b)
        }
        else {
            resolve(r.content);
        }
    })
}