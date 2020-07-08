import { staticFileProcess } from "./static-file";
import { FileProcessors } from "../file-processor";

export let defaultFileProcessors: FileProcessors = {
    "txt": staticFileProcess,
    "html": staticFileProcess,
}