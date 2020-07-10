import { RequestProcessor } from "../request-processor";
import { pathConcat } from "../path-concat";
import { defaultFileProcessors } from "../file-processors";
import { errors } from "../errors";
import { FileProcessors, FileProcessor } from "../file-processor";


export type StaticFileProcessorConfig = {
    fileProcessors: FileProcessors
}

export class StaticFileRequestProcessor implements RequestProcessor {

    #fileProcessors: FileProcessors;

    constructor() {
        this.#fileProcessors = Object.assign({}, defaultFileProcessors);
    }

    execute(args: { virtualPath: string; physicalPath?: string | null; }): { statusCode?: number; content: import("../request-processor").Content; contentType?: string; } | null {
        if (args.physicalPath == null)
            throw errors.pageNotFound(args.virtualPath);

        let ext = "";
        if (args.physicalPath.indexOf(".") < 0) {
            args.physicalPath = pathConcat(args.physicalPath, "index.html");
        }

        let arr = args.physicalPath.split(".");
        console.assert(arr.length == 2);
        ext = arr[1];

        let fileProcessor = this.#fileProcessors[ext];
        if (fileProcessor == null)
            throw errors.fileTypeNotSupport(ext);

        return fileProcessor(args);
    }

    get fileProcessors() {
        return this.#fileProcessors;
    }

}

export let staticFileRequestProcessor = new StaticFileRequestProcessor();