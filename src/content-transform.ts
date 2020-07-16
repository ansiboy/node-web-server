import { Content, RequestContext } from "./request-processor";

export type ContentTransform = (content: Content, context: RequestContext) => Content | Promise<Content>; 