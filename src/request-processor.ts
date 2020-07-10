import { VirtualDirectory } from "./virtual-directory";

export type Content = string | Promise<string>;
export type RequestProcessor = (args: { virtualPath: string, physicalPath?: string | null }) =>
    { statusCode?: number, content: Content, contentType?: string } | null;