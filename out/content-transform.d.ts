import { RequestContext, RequestResult } from "./request-processor";
export declare type RequestResultTransform = (result: RequestResult, context: RequestContext) => RequestResult | Promise<RequestResult>;
