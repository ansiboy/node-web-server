import { textFileProcessor } from "./static-file";
import { FileProcessors } from "../file-processor";
import { RequestProcessor } from "../request-processor";

export let defaultFileProcessors: { [key: string]: RequestProcessor } = {
    "txt": textFileProcessor,
    "html": textFileProcessor,
}