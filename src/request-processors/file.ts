import { RequestProcessor, RequestContext } from "../request-processor";
import * as path from "path";
import { processorPriorities } from "./priority";

export class FileRequestProcessor implements RequestProcessor {
    priority = processorPriorities.FileRequestProcessor;

    private _processors: { [ext: string]: RequestProcessor } = {};

    execute(ctx: RequestContext) {
        let ext = path.extname(ctx.virtualPath);
        let processor = this.processors[ext];
        if (!processor)
            return null;

        return processor.execute(ctx);
    }

    get processors() {
        return this._processors;
    }

}