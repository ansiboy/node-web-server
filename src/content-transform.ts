import { RequestContext, RequestResult } from "./request-processor";

export type RequestResultTransform = (result: RequestResult, context: RequestContext) => RequestResult | Promise<RequestResult>;