import { RequestContext, RequestResult } from "./request-processor";

export type ContentTransformFunc = (result: RequestResult, context: RequestContext) => RequestResult | Promise<RequestResult>;

export interface ContentTransform {
    execute(result: RequestResult, context: RequestContext): RequestResult | Promise<RequestResult>;
}
