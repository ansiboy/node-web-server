import { textFileProcessor } from "./static-file";
import { FileProcessor } from "../file-processor";

export let defaultFileProcessors: { [key: string]: FileProcessor } = {
    "txt": textFileProcessor,
    "html": textFileProcessor,
    "js": textFileProcessor,
}