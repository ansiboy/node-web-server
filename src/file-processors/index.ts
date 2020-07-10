import { textFileProcessor } from "./static-file";
import { FileProcessors, FileProcessor } from "../file-processor";
import { RequestProcessor } from "../request-processor";

export let defaultFileProcessors: { [key: string]: FileProcessor } = {
    "txt": textFileProcessor,
    "html": textFileProcessor,
}