import { Content } from "./request-processor";
export declare type ContentTransform = (content: Content) => Content | Promise<Content>;
