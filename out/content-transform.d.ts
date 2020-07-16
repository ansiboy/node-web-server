import { Content, RequestContext } from "./request-processor";
export declare type ContentTransform = (content: Content, context: RequestContext) => Content | Promise<Content>;
