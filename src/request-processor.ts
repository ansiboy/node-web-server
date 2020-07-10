
export type Content = string | Promise<string>;
// export type RequestProcessor = (args: {
//     virtualPath: string, physicalPath?: string | null,
//     config: any
// }) =>
//     { statusCode?: number, content: Content, contentType?: string } | null;
export interface RequestProcessor {
    execute(args: { virtualPath: string, physicalPath?: string | null }): { statusCode?: number, content: Content, contentType?: string } | null;
}